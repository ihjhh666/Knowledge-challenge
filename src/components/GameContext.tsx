import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GameState, RoomPlayer, ChatMessage, PeerMessage, Question, RoomVisibility } from '../lib/types';
import { createPeer } from '../lib/peer';
import { storage } from '../lib/storage';
import { GENERAL_KNOWLEDGE_EXPANDED as GENERAL_KNOWLEDGE, FB_EXPANDED as FOOTBALL, MOVIES_EXPANDED as MOVIES, ANIME_EXPANDED as ANIME, SCI_EXPANDED as SCIENCE, HIST_EXPANDED as HISTORY, ISLAMIC_EXPANDED as ISLAMIC, MATH_EXPANDED as MATH } from '../lib/dynamicQuestions';
import { audio } from '../lib/audio';
import { createPublicRoom, updatePublicRoom, deletePublicRoom } from '../lib/firebase';
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

const ALL_GAME_QUESTIONS = [
  ...GENERAL_KNOWLEDGE,
  ...FOOTBALL,
  ...MOVIES,
  ...ANIME,
  ...SCIENCE,
  ...HISTORY,
  ...ISLAMIC,
  ...MATH
];

export interface GameContextType {
  state: GameState | null;
  playerId: string;
  isHost: boolean;
  createRoom: (category?: string, roomVisibility?: RoomVisibility, password?: string, maxPlayers?: number) => void;
  joinRoom: (roomId: string, password?: string, onError?: (err: string) => void) => void;
  sendMessage: (text: string) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswer: (answer: string, timeToAnswerMs: number) => void;
  kickPlayer: (playerId: string) => void;
  mutePlayer: (playerId: string, isMuted: boolean) => void;
  changeCategory: (category: string) => void;
  forceNextQuestion: () => void;
  transferHost: (playerId: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string>('');
  
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const hostConnectionRef = useRef<DataConnection | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const isHostRef = useRef<boolean>(false);
  const lastPingTimes = useRef<Record<string, number>>({});

  // Sync state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Cleanup on window close
  useEffect(() => {
    const handleBeforeUnload = () => {
       if (isHostRef.current && stateRef.current?.roomId) {
         // Only delete if I am the last player
         if (Object.keys(stateRef.current.players).length <= 1) {
           deletePublicRoom(stateRef.current.roomId);
         }
       } else if (hostConnectionRef.current?.open) {
         // Tell host we are leaving explicitly so they don't wait 7 seconds
         hostConnectionRef.current.send({ type: 'LEAVE', playerId });
       }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playerId]);

  const broadcast = (message: PeerMessage) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  };

  // Ping interval
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (!isHostRef.current && hostConnectionRef.current?.open) {
         hostConnectionRef.current.send({ type: 'PING', playerId });
      }
      
      if (isHostRef.current && stateRef.current) {
         const now = Date.now();
         let changed = false;
         const players = { ...stateRef.current.players };
         
         Object.keys(players).forEach(pId => {
           if (pId !== playerId) {
              const lastPing = lastPingTimes.current[pId] || now; // if not set yet, assume now
              if (now - lastPing > 7000) {
                 // Missed pings for 7 seconds!
                 delete players[pId];
                 changed = true;
                 
                 const conn = connectionsRef.current.get(pId);
                 if (conn) {
                   conn.close();
                   connectionsRef.current.delete(pId);
                 }
                 delete lastPingTimes.current[pId];
                 if (disconnectDelays.current[pId]) {
                   clearTimeout(disconnectDelays.current[pId]);
                   delete disconnectDelays.current[pId];
                 }
              }
           }
         });
         
         if (changed) {
            const newState = { ...stateRef.current, players };
            setState(newState);
            broadcast({ type: 'STATE_UPDATE', state: newState });
            updatePublicRoom(newState.roomId, {
              playerCount: Object.keys(newState.players).length
            });
            checkAllAnswered(newState);
         }
      }
    }, 2500);
    return () => clearInterval(pingInterval);
  }, [playerId]);

  // Added disconnect delays tracking
  const disconnectDelays = useRef<Record<string, NodeJS.Timeout>>({});

  const checkAllAnswered = (currentState: GameState) => {
    if (currentState.status !== 'playing') return;
    const allAnswered = (Object.values(currentState.players) as RoomPlayer[]).every(p => p.hasAnsweredCurrentRound);
    if (allAnswered) {
      const revealingState: GameState = {
        ...currentState,
        status: 'revealing'
      };
      setState(revealingState);
      broadcast({ type: 'STATE_UPDATE', state: revealingState });

      // Automatically go to next round after 3 seconds
      setTimeout(() => {
        if (stateRef.current) {
          startNextRound(stateRef.current);
        }
      }, 3000);
    }
  };

  const handleMessage = (message: PeerMessage, senderId?: string) => {
    switch (message.type) {
      case 'STATE_UPDATE':
        if (stateRef.current?.status === 'waiting' && message.state.status === 'playing') {
          audio.startGame();
        }
        setState(message.state);
        break;
      case 'JOIN':
        if (isHostRef.current && stateRef.current) {
          const conn = senderId ? connectionsRef.current.get(senderId) : null;
          if (stateRef.current.roomVisibility === 'password' && message.password !== stateRef.current.password) {
            if (conn) {
              conn.send({ type: 'JOIN_REJECTED', reason: 'كلمة المرور غير صحيحة' });
              setTimeout(() => conn.close(), 500);
            }
            break;
          }
          if (stateRef.current.maxPlayers && Object.keys(stateRef.current.players).length >= stateRef.current.maxPlayers) {
            if (conn) {
               conn.send({ type: 'JOIN_REJECTED', reason: 'الغرفة ممتلئة' });
               setTimeout(() => conn.close(), 500);
            }
            break;
          }

          if (senderId && disconnectDelays.current[senderId]) {
             clearTimeout(disconnectDelays.current[senderId]);
             delete disconnectDelays.current[senderId];
          }

          const playerName = message.player.username;
          const newState = {
            ...stateRef.current,
            players: {
              ...stateRef.current.players,
              [message.player.id]: {
                ...message.player,
                hasAnsweredCurrentRound: false,
                lastAnswerSucceeded: false,
                isMuted: false
              }
            }
          };
          setState(newState);
          broadcast({ type: 'STATE_UPDATE', state: newState });
          
          updatePublicRoom(newState.roomId, {
            playerCount: Object.keys(newState.players).length
          });
        }
        break;
      case 'CHAT':
        if (isHostRef.current && stateRef.current) {
          const senderPlayer = stateRef.current.players[message.message.senderId];
          if (senderPlayer && senderPlayer.isMuted) {
             const conn = connectionsRef.current.get(message.message.senderId);
             if (conn && conn.open) {
                // Send a private rejection / system message
                const msg: ChatMessage = {
                  id: Math.random().toString(),
                  senderId: 'system',
                  senderName: 'النظام',
                  text: 'لا يمكنك إرسال رسائل (أنت مكتوم بواسطة المضيف)',
                  timestamp: Date.now()
                };
                conn.send({ type: 'STATE_UPDATE', state: { ...stateRef.current, messages: [...stateRef.current.messages, msg] } });
             }
             break; // Block muted player
          }

          const newState = {
            ...stateRef.current,
            messages: [...stateRef.current.messages, message.message]
          };
          setState(newState);
          broadcast({ type: 'STATE_UPDATE', state: newState });
        }
        break;
      case 'TOGGLE_READY':
        if (isHostRef.current && stateRef.current) {
          const p = stateRef.current.players[message.playerId];
          if (p) {
            const newState = {
              ...stateRef.current,
              players: {
                ...stateRef.current.players,
                [message.playerId]: { ...p, isReady: !p.isReady }
              }
            };
            setState(newState);
            broadcast({ type: 'STATE_UPDATE', state: newState });
          }
        }
        break;
      case 'START_GAME':
        if (isHostRef.current && stateRef.current) {
          let currentState = stateRef.current;
          if (currentState.status === 'finished') {
            const updatedPlayers = { ...currentState.players };
            (Object.values(updatedPlayers) as RoomPlayer[]).forEach(p => {
              updatedPlayers[p.id] = { ...p, score: 0 };
            });
            currentState = { ...currentState, players: updatedPlayers, round: 0 };
          }
          startNextRound(currentState);
        }
        break;
      case 'SUBMIT_ANSWER':
        if (isHostRef.current && stateRef.current) {
          handleAnswer(message.playerId, message.answer, message.timeToAnswerMs);
        }
        break;
      case 'KICK':
        if (isHostRef.current && stateRef.current) {
           const conn = connectionsRef.current.get(message.playerId);
           if (conn) {
             conn.send({ type: 'KICKED', reason: 'تم طردك من قبل المالك.' });
             setTimeout(() => conn.close(), 500);
           }
           
           if (disconnectDelays.current[message.playerId]) {
             clearTimeout(disconnectDelays.current[message.playerId]);
           }
           const { [message.playerId]: _, ...remainingPlayers } = stateRef.current.players;
           const newState = { ...stateRef.current, players: remainingPlayers };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, {
             playerCount: Object.keys(newState.players).length
           });
           checkAllAnswered(newState);
        }
        break;
      case 'KICKED':
        // received by peer
        alert(message.reason);
        leaveRoom();
        break;
      case 'MUTE':
        if (isHostRef.current && stateRef.current) {
           const p = stateRef.current.players[message.playerId];
           if (p) {
             const newState = {
               ...stateRef.current,
               players: {
                 ...stateRef.current.players,
                 [message.playerId]: { ...p, isMuted: message.isMuted }
               }
             };
             setState(newState);
             broadcast({ type: 'STATE_UPDATE', state: newState });
           }
        }
        break;
      case 'CHANGE_CATEGORY':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const newState = { ...stateRef.current, category: message.category };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, { category: message.category });
        }
        break;
      case 'FORCE_NEXT_QUESTION':
        if (isHostRef.current && stateRef.current) {
           // Provide an empty answer for those who didn't
           const currentState = stateRef.current;
           (Object.values(currentState.players) as RoomPlayer[]).forEach(p => {
              if (!p.hasAnsweredCurrentRound) {
                 handleAnswer(p.id, '', 15000);
              }
           });
        }
        break;
      case 'LEAVE':
        if (isHostRef.current && stateRef.current) {
           const conn = connectionsRef.current.get(message.playerId);
           if (conn) {
             clearTimeout(disconnectDelays.current[message.playerId]);
           }
           const { [message.playerId]: _, ...remainingPlayers } = stateRef.current.players;
           const newState = { ...stateRef.current, players: remainingPlayers };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, {
             playerCount: Object.keys(newState.players).length
           });
           checkAllAnswered(newState);
        }
        break;
      case 'TRANSFER_HOST':
        if (isHostRef.current && stateRef.current) {
           // Host decided to transfer manually
           const newHostId = message.playerId;
           const oldState = stateRef.current;
           const updatedPlayers = { ...oldState.players };
           (Object.values(updatedPlayers) as RoomPlayer[]).forEach(p => p.isHost = false);
           if (updatedPlayers[newHostId]) {
              updatedPlayers[newHostId].isHost = true;
           }
           const newState = { ...oldState, players: updatedPlayers };
           
           setState(newState);
           broadcast({ type: 'TRANSFER_HOST', playerId: newHostId });
           
           // the old host steps down and re-joins
           setTimeout(() => {
              joinRoom(newState.roomId);
           }, 1000);
        } else if (stateRef.current) {
           const newHostId = message.playerId;
           if (playerId === newHostId) {
              const oldState = stateRef.current;
              // I am the new host manually!
              setIsHost(true);
              if (peerRef.current) peerRef.current.destroy();
              connectionsRef.current.clear();
              hostConnectionRef.current = null;
              
              const newPeer = createPeer(oldState.roomId);
              peerRef.current = newPeer;
              
              newPeer.on('open', () => {
                 const updatedPlayers = { ...oldState.players };
                 (Object.values(updatedPlayers) as RoomPlayer[]).forEach(p => p.isHost = false);
                 updatedPlayers[playerId] = { ...updatedPlayers[playerId], isHost: true };
                 const newState = { ...oldState, players: updatedPlayers };
                 setState(newState);
                 
                 if (newState.roomVisibility === 'public' || newState.roomVisibility === 'password') {
                    updatePublicRoom(newState.roomId, {
                       hostName: updatedPlayers[playerId].username
                    });
                 }
              });

              newPeer.on('connection', (c) => {
                 connectionsRef.current.set(c.peer, c);
                 c.on('data', (data) => handleMessage(data as PeerMessage, c.peer));
                 c.on('close', () => {
                    connectionsRef.current.delete(c.peer);
                    disconnectDelays.current[c.peer] = setTimeout(() => {
                      if (stateRef.current) {
                         const { [c.peer]: _, ...remainingPlayers } = stateRef.current.players;
                         const newState = { ...stateRef.current, players: remainingPlayers };
                         setState(newState);
                         broadcast({ type: 'STATE_UPDATE', state: newState });
                         updatePublicRoom(newState.roomId, {
                           playerCount: Object.keys(newState.players).length
                         });
                         checkAllAnswered(newState);
                      }
                    }, 7000);
                 });
                 c.on('error', (err) => console.error('New host conn error:', err));
                 
                 c.on('open', () => {
                   if (stateRef.current) c.send({ type: 'STATE_UPDATE', state: stateRef.current });
                 });
              });
              newPeer.on('error', (err) => console.error('New host peer error:', err));
           } else {
              // Not the new host, let's rejoin pointing to the new host
              setTimeout(() => {
                 joinRoom(stateRef.current!.roomId);
              }, 3000);
           }
        }
        break;
      case 'PING':
        if (isHostRef.current) {
           lastPingTimes.current[message.playerId] = Date.now();
        }
        break;
    }
  };

  const startNextRound = (currentState: GameState) => {
    let nextRound = currentState.round + 1;
    if (nextRound > currentState.totalRounds) {
       // Game Over
       const newState = { ...currentState, status: 'finished' as const };
       setState(newState);
       broadcast({ type: 'STATE_UPDATE', state: newState });
       
       // Update Firebase Room Status
       updatePublicRoom(currentState.roomId, { status: 'finished' });
       return;
    }

    let questionsPool = ALL_GAME_QUESTIONS;
    if (currentState.category === '🧠 معلومات عامة') questionsPool = GENERAL_KNOWLEDGE;
    else if (currentState.category === '⚽ كرة قدم') questionsPool = FOOTBALL;
    else if (currentState.category === '📜 تاريخ') questionsPool = HISTORY;
    else if (currentState.category === '🔬 علوم') questionsPool = SCIENCE;
    else if (currentState.category === '🎬 أفلام') questionsPool = MOVIES;
    else if (currentState.category === '🎌 أنمي') questionsPool = ANIME;
    else if (currentState.category === '🧮 رياضيات') questionsPool = MATH;

    // Load global seen history from localStorage to prevent repeats across games
    let globalSeenQuestions: string[] = [];
    try {
      const stored = localStorage.getItem('seenQuestionsHistory');
      if (stored) globalSeenQuestions = JSON.parse(stored);
    } catch(e) {}

    // Filter out already asked questions, handle pool exhaustion gracefully
    let availableQuestions = questionsPool.filter(q => !currentState.askedQuestions.includes(q.text));
    
    // Also try to filter out global history
    let unseenAvailable = availableQuestions.filter(q => !globalSeenQuestions.includes(q.text));
    
    if (unseenAvailable.length > 0) {
      availableQuestions = unseenAvailable;
    } else if (availableQuestions.length === 0) {
      availableQuestions = questionsPool; // fallback if all were asked completely
    }

    const q = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Update global history (keep max 200 questions to avoid filling storage)
    globalSeenQuestions.push(q.text);
    if (globalSeenQuestions.length > 200) {
      globalSeenQuestions = globalSeenQuestions.slice(globalSeenQuestions.length - 200);
    }
    try {
      localStorage.setItem('seenQuestionsHistory', JSON.stringify(globalSeenQuestions));
    } catch(e) {}

    const options = [q.correctAnswer, ...q.wrongOptions].sort(() => Math.random() - 0.5);
    
    // reset players
    const updatedPlayers = { ...currentState.players };
    (Object.values(updatedPlayers) as RoomPlayer[]).forEach(p => {
      updatedPlayers[p.id] = { ...p, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false };
    });

    const newState: GameState = {
      ...currentState,
      status: 'playing',
      round: nextRound,
      roundStartTime: Date.now(),
      askedQuestions: [...(currentState.askedQuestions || []), q.text],
      currentQuestion: {
        text: q.text,
        correctAnswer: q.correctAnswer,
        options
      },
      players: updatedPlayers
    };
    setState(newState);
    broadcast({ type: 'STATE_UPDATE', state: newState });
    
    if (nextRound === 1) {
      updatePublicRoom(currentState.roomId, { status: 'playing' });
    }
  };

  const handleAnswer = (pId: string, answer: string, timeTaken: number) => {
    const currentState = stateRef.current;
    if (!currentState || currentState.status !== 'playing' || !currentState.currentQuestion) return;

    const player = currentState.players[pId];
    if (!player || player.hasAnsweredCurrentRound) return;

    const isCorrect = answer === currentState.currentQuestion.correctAnswer;
    const scoreEarned = isCorrect ? Math.max(10, 100 - Math.floor(timeTaken / 100)) : 0;

    const updatedPlayers = {
      ...currentState.players,
      [pId]: {
        ...player,
        hasAnsweredCurrentRound: true,
        lastAnswerSucceeded: isCorrect,
        score: player.score + scoreEarned
      }
    };

    const newState = { ...currentState, players: updatedPlayers };
    setState(newState);
    broadcast({ type: 'STATE_UPDATE', state: newState });
    checkAllAnswered(newState);
  };

  const createRoom = React.useCallback((category?: string, roomVisibility: RoomVisibility = 'public', password?: string, maxPlayers: number = 10) => {
    const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const myId = `host-${Math.random().toString(36).substr(2, 9)}`;
    const username = storage.getPlayerName() || 'شبح';
    const roomCategory = category || '🧠 معلومات عامة';
    
    setPlayerId(myId);
    setIsHost(true);

    const peer = createPeer(roomId);
    peerRef.current = peer;

    peer.on('open', () => {
      const initialState: GameState = {
        roomId,
        category: roomCategory,
        roomVisibility,
        maxPlayers,
        password,
        status: 'waiting',
        round: 0,
        totalRounds: 10,
        players: {
           [myId]: { id: myId, username, isReady: true, isHost: true, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false }
        },
        messages: [],
        askedQuestions: []
      };
      setState(initialState);
      audio.joinLobby();
      
      // Save Public Room to Firebase only if public or password
      if (roomVisibility === 'public' || roomVisibility === 'password') {
        createPublicRoom({
          roomId,
          hostName: username,
          category: roomCategory,
          playerCount: 1,
          maxPlayers,
          roomVisibility,
          status: 'waiting',
          createdAt: Date.now()
        });
      }
    });

    peer.on('connection', (conn) => {
      connectionsRef.current.set(conn.peer, conn);
      
      conn.on('data', (data) => {
        handleMessage(data as PeerMessage, conn.peer);
      });
      
      conn.on('close', () => {
        connectionsRef.current.delete(conn.peer);
        // Wait 7 seconds before removing player
        disconnectDelays.current[conn.peer] = setTimeout(() => {
          if (stateRef.current) {
             const { [conn.peer]: _, ...remainingPlayers } = stateRef.current.players;
             const newState = { ...stateRef.current, players: remainingPlayers };
             
             // Auto-transfer host logic: If we wanted to transfer host, we do it here. 
             // But the host is the server, so you can't transfer from here if the host themselves leaves!
             // This event only fires when a client leaves.

             setState(newState);
             broadcast({ type: 'STATE_UPDATE', state: newState });
             updatePublicRoom(newState.roomId, {
               playerCount: Object.keys(newState.players).length
             });
             checkAllAnswered(newState);
          }
        }, 7000);
      });
      
      conn.on('error', (err) => {
         console.error('Host connection error:', err);
      });
    });

    peer.on('error', (err) => {
      console.error('Host peer error:', err);
    });
  }, []);

  const joinRoom = React.useCallback((roomId: string, password?: string, onError?: (err: string) => void) => {

    if (peerRef.current) {
      peerRef.current.destroy();
    }
    
    const myId = `peer-${Math.random().toString(36).substr(2, 9)}`;
    const username = storage.getPlayerName() || 'شبح';
    
    setPlayerId(myId);
    setIsHost(false);

    const peer = createPeer(myId);
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(roomId);
      hostConnectionRef.current = conn;
      
      conn.on('open', () => {
        conn.send({
          type: 'JOIN',
          player: { id: myId, username, isReady: false, isHost: false, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false },
          password
        });
        audio.joinLobby();
      });

      let rejectedReason: string | null = null;
      conn.on('data', (data) => {
        const msg = data as PeerMessage;
        if (msg.type === 'STATE_UPDATE') {
          setState(msg.state);
        } else if (msg.type === 'JOIN_REJECTED') {
          rejectedReason = msg.reason;
          if (onError) onError(msg.reason);
          conn.close();
        }
      });
      
      conn.on('close', () => {
        const oldState = stateRef.current;
        if (oldState && !rejectedReason) {
           const players = Object.values(oldState.players) as RoomPlayer[];
           const remaining = players.filter(p => !p.isHost);
           if (remaining.length > 0) {
              remaining.sort((a, b) => a.id.localeCompare(b.id));
              if (remaining[0].id === myId) {
                 // I am the new host!
                 setIsHost(true);
                 if (peerRef.current) peerRef.current.destroy();
                 connectionsRef.current.clear();
                 hostConnectionRef.current = null;
                 
                 const newPeer = createPeer(roomId);
                 peerRef.current = newPeer;
                 
                 newPeer.on('open', () => {
                    const updatedPlayers = { ...oldState.players };
                    const oldHostId = Object.keys(updatedPlayers).find(k => updatedPlayers[k].isHost);
                    if (oldHostId) delete updatedPlayers[oldHostId];
                    
                    updatedPlayers[myId] = { ...updatedPlayers[myId], isHost: true };
                    const newState = { ...oldState, players: updatedPlayers };
                    setState(newState);
                    
                    if (newState.roomVisibility === 'public' || newState.roomVisibility === 'password') {
                       createPublicRoom({
                          roomId: newState.roomId,
                          hostName: updatedPlayers[myId].username,
                          category: newState.category,
                          playerCount: Object.keys(updatedPlayers).length,
                          maxPlayers: newState.maxPlayers || 10,
                          roomVisibility: newState.roomVisibility,
                          status: newState.status,
                          createdAt: Date.now()
                       });
                    }
                 });

                 newPeer.on('connection', (c) => {
                    connectionsRef.current.set(c.peer, c);
                    c.on('data', (data) => handleMessage(data as PeerMessage, c.peer));
                    c.on('close', () => {
                       connectionsRef.current.delete(c.peer);
                       disconnectDelays.current[c.peer] = setTimeout(() => {
                         if (stateRef.current) {
                            const { [c.peer]: _, ...remainingPlayers } = stateRef.current.players;
                            const newState = { ...stateRef.current, players: remainingPlayers };
                            setState(newState);
                            broadcast({ type: 'STATE_UPDATE', state: newState });
                            updatePublicRoom(newState.roomId, {
                              playerCount: Object.keys(newState.players).length
                            });
                            checkAllAnswered(newState);
                         }
                       }, 7000);
                    });
                    c.on('error', (err) => console.error('New host conn error:', err));
                    
                    c.on('open', () => {
                      // Send current state to newly rejoined peers
                      if (stateRef.current) c.send({ type: 'STATE_UPDATE', state: stateRef.current });
                    });
                 });
                 newPeer.on('error', (err) => console.error('New host peer error:', err));
                 return; // Prevent normal close handling
              } else {
                 // Not the new host, wait 3 seconds and rejoin
                 setTimeout(() => {
                    joinRoom(roomId, password, onError);
                 }, 3000);
                 return; // Prevent normal close handling
              }
           }
        }

        setState(null);
        if (!rejectedReason && onError) onError('انقطع الاتصال بالغرفة');
      });
      
      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setState(null);
        if (onError) onError('حدث خطأ في الاتصال بالغرفة');
      });
    });

    peer.on('error', (err: any) => {
      if (err.type === 'peer-unavailable') {
         console.warn('Peer unavailable (host may have left). Removing room from DB:', roomId);
         deletePublicRoom(roomId);
      } else {
         console.error('Peer error:', err);
      }
      setTimeout(() => {
        if (!stateRef.current) {
          if (onError) onError('تعذر الاتصال بالغرفة - قد يكون المضيف غادر');
        }
      }, 500);
      setState(null);
    });
  }, []);

  const sendMessage = React.useCallback((text: string) => {
    const username = storage.getPlayerName() || 'شبح';
    const msg: ChatMessage = {
      id: Math.random().toString(),
      senderId: playerId,
      senderName: username,
      text,
      timestamp: Date.now()
    };
    
    if (isHostRef.current) {
       handleMessage({ type: 'CHAT', message: msg });
    } else if (hostConnectionRef.current?.open) {
       hostConnectionRef.current.send({ type: 'CHAT', message: msg });
    }
  }, [playerId]);

  const toggleReady = React.useCallback(() => {
    if (isHostRef.current) {
      handleMessage({ type: 'TOGGLE_READY', playerId });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'TOGGLE_READY', playerId });
    }
  }, [playerId]);
  
  const startGame = React.useCallback(() => {
    if (isHostRef.current) {
      handleMessage({ type: 'START_GAME' });
    }
  }, []);

  const submitAnswer = React.useCallback((answer: string, timeToAnswerMs: number) => {
    if (isHostRef.current) {
      handleMessage({ type: 'SUBMIT_ANSWER', playerId, answer, timeToAnswerMs });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'SUBMIT_ANSWER', playerId, answer, timeToAnswerMs });
    }
  }, [playerId]);

  const leaveRoom = React.useCallback(() => {
    if (!isHostRef.current && hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'LEAVE', playerId });
    }
    
    if (isHostRef.current && stateRef.current?.roomId) {
      if (Object.keys(stateRef.current.players).length <= 1) {
        deletePublicRoom(stateRef.current.roomId);
      }
    }
    
    // Slight delay to ensure LEAVE message is sent before destroying
    setTimeout(() => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      setState(null);
      setIsHost(false);
      setPlayerId('');
      connectionsRef.current.clear();
      hostConnectionRef.current = null;
    }, 100);
  }, [playerId]);

  const kickPlayer = React.useCallback((playerIdToKick: string) => {
    if (isHostRef.current) {
      handleMessage({ type: 'KICK', playerId: playerIdToKick });
    }
  }, []);

  const mutePlayer = React.useCallback((playerIdToMute: string, isMuted: boolean) => {
    if (isHostRef.current) {
      handleMessage({ type: 'MUTE', playerId: playerIdToMute, isMuted });
    }
  }, []);

  const changeCategory = React.useCallback((category: string) => {
    if (isHostRef.current) {
      handleMessage({ type: 'CHANGE_CATEGORY', category });
    }
  }, []);

  const forceNextQuestion = React.useCallback(() => {
    if (isHostRef.current) {
      handleMessage({ type: 'FORCE_NEXT_QUESTION' });
    }
  }, []);

  const transferHost = React.useCallback((playerIdToTransfer: string) => {
    if (isHostRef.current) {
      handleMessage({ type: 'TRANSFER_HOST', playerId: playerIdToTransfer });
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, playerId, isHost, createRoom, joinRoom, sendMessage, toggleReady, leaveRoom, startGame, submitAnswer, kickPlayer, mutePlayer, changeCategory, forceNextQuestion, transferHost }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
