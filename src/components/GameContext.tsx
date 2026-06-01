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
  createRoom: (category?: string, roomVisibility?: RoomVisibility, password?: string, maxPlayers?: number, gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino') => void;
  joinRoom: (roomId: string, password?: string, onError?: (err: string) => void) => void;
  sendMessage: (text: string) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswer: (answer: string, timeToAnswerMs: number) => void;
  kickPlayer: (playerId: string) => void;
  mutePlayer: (playerId: string, isMuted: boolean) => void;
  changeCategory: (category: string) => void;
  changeGameMode: (gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino') => void;
  returnToLobby: () => void;
  requestRematch: () => void;
  forceNextQuestion: () => void;
  transferHost: (playerId: string) => void;
  catchFish: (fishId: number, points: number, fType: string) => void;
  spawnFish: (fish: any) => void;
  sendPenaltyAction: (action: 'kicker' | 'goalie', dir: 'left' | 'center' | 'right') => void;
  sendDominoAction: (actionDetails: any) => void;
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
  const intentionalLeaveRef = useRef<boolean>(false);
  const fishingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

    if (currentState.gameMode === 'penalty' && Object.keys(currentState.players).length < 2) {
       // opponent disconnected
       const remainingId = Object.keys(currentState.players)[0];
       const updatedPlayers = { ...currentState.players };
       if (remainingId) updatedPlayers[remainingId].score += 10;
       
       const finSt: GameState = { ...currentState, players: updatedPlayers, status: 'finished' };
       setState(finSt);
       broadcast({ type: 'STATE_UPDATE', state: finSt });
       updatePublicRoom(finSt.roomId, { status: 'finished' });
       return;
    }

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
              updatedPlayers[p.id] = { ...p, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false };
            });
            currentState = { ...currentState, players: updatedPlayers, round: 0, rematchApprovals: [] };
          }
          if (currentState.gameMode === 'fishing') {
            startFishingMode(currentState);
          } else if (currentState.gameMode === 'penalty') {
            startPenaltyMode(currentState);
          } else if (currentState.gameMode === 'domino') {
            startDominoMode(currentState);
          } else {
            startNextRound(currentState);
          }
        }
        break;
      case 'PENALTY_ACTION':
        if (isHostRef.current && stateRef.current && stateRef.current.gameMode === 'penalty' && stateRef.current.penaltyState) {
          handlePenaltyAction(message.playerId, message.action, message.dir);
        }
        break;
      case 'DOMINO_ACTION':
        if (isHostRef.current && stateRef.current && stateRef.current.gameMode === 'domino' && stateRef.current.dominoState) {
          const newState = {
            ...stateRef.current,
            dominoState: {
               ...stateRef.current.dominoState,
               ...message.actionDetails
            }
          };
          setState(newState);
          broadcast({ type: 'STATE_UPDATE', state: newState });
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
      case 'CHANGE_MODE':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const newCat = message.gameMode === 'fishing' ? '🎣 صيد السمك' : message.gameMode === 'penalty' ? '⚽ ركلات الجزاء' : message.gameMode === 'domino' ? '🎲 الدومينو' : '🧠 معلومات عامة';
           const newState = { ...stateRef.current, gameMode: message.gameMode, category: message.gameMode === 'quiz' && stateRef.current.category ? stateRef.current.category : newCat };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, { gameMode: message.gameMode, category: newState.category });
        }
        break;
      case 'REQUEST_REMATCH':
        if (isHostRef.current && stateRef.current && (stateRef.current.status === 'finished' || (stateRef.current.gameMode === 'domino' && stateRef.current.dominoState?.winnerId))) {
           const oldState = stateRef.current;
           const isHostSender = message.playerId === playerId;
           
           if (isHostSender) {
               if (oldState.gameMode === 'domino') {
                   startDominoMode({ ...oldState, rematchApprovals: [] });
               } else {
                   handleMessage({ type: 'START_GAME' });
               }
           } else {
               const approvals = oldState.rematchApprovals || [];
               if (!approvals.includes(message.playerId)) {
                  approvals.push(message.playerId);
                  const newState = { ...oldState, rematchApprovals: approvals };
                  setState(newState);
                  broadcast({ type: 'STATE_UPDATE', state: newState });
                  
                  if (approvals.length >= Object.keys(newState.players).length) {
                     if (newState.gameMode === 'domino') {
                       startDominoMode({ ...newState, rematchApprovals: [] });
                     } else {
                       handleMessage({ type: 'START_GAME' });
                     }
                  }
               }
           }
        }
        break;
      case 'RETURN_TO_LOBBY':
        if (isHostRef.current && stateRef.current) {
           const oldState = stateRef.current;
           const updatedPlayers = { ...oldState.players };
           (Object.values(updatedPlayers) as RoomPlayer[]).forEach(p => {
              updatedPlayers[p.id] = { ...p, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false, isReady: false };
           });
           const newState = { 
               ...oldState, 
               status: 'waiting' as const, 
               players: updatedPlayers, 
               round: 0,
               fishingTimeLeft: undefined,
               penaltyState: undefined,
               dominoState: undefined
           };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, { status: 'waiting' });
        }
        break;
      case 'FISH_SPAWN':
        if (isHostRef.current) {
          broadcast(message);
          window.dispatchEvent(new CustomEvent('fishing_event', { detail: message }));
        }
        break;
      case 'FISH_CATCH':
        if (isHostRef.current && stateRef.current) {
          const caughtList = stateRef.current.caughtFishIds || [];
          if (caughtList.includes(message.fishId)) {
             return; // Already caught by someone else
          }
          
          const newCaughtList = [...caughtList, message.fishId];
          const newPlayers = { ...stateRef.current.players };
          if (newPlayers[message.playerId]) {
             newPlayers[message.playerId] = {
                ...newPlayers[message.playerId],
                score: newPlayers[message.playerId].score + message.points
             };
          }
          const newState = { ...stateRef.current, players: newPlayers, caughtFishIds: newCaughtList };
          setState(newState);
          broadcast(message);
          window.dispatchEvent(new CustomEvent('fishing_event', { detail: message }));
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

  const startDominoMode = (currentState: GameState) => {
    const pIds = Object.keys(currentState.players);
    if (pIds.length < 2) return;
    const p1 = pIds[0];
    const p2 = pIds[1];
    
    const tiles: any[] = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        tiles.push({ id: `${i}-${j}`, val1: i, val2: j });
      }
    }
    const shuffled = tiles.sort(() => Math.random() - 0.5);
    
    let p1Hand = shuffled.slice(0, 7);
    let p2Hand = shuffled.slice(7, 14);
    const bYard = shuffled.slice(14);
    
    let maxDoubleVal = -1;
    let starterId = p1;
    let startTile = null;

    const checkHand = (hand: any[], player: string) => {
      for (const t of hand) {
        if (t.val1 === t.val2 && t.val1 > maxDoubleVal) {
          maxDoubleVal = t.val1;
          starterId = player;
          startTile = t;
        }
      }
    };
    
    checkHand(p1Hand, p1);
    checkHand(p2Hand, p2);

    let board = [];
    if (startTile) {
      if (starterId === p1) p1Hand = p1Hand.filter(t => t.id !== startTile!.id);
      else p2Hand = p2Hand.filter(t => t.id !== startTile!.id);
      
      board.push({
        piece: startTile,
        connectedVia: startTile.val1,
        freeEnd: startTile.val1,
        type: 'root',
        isDouble: true
      });
      // the next turn goes to the OTHER player
      starterId = starterId === p1 ? p2 : p1;
    } else {
      // random starter if no double found
      starterId = Math.random() > 0.5 ? p1 : p2;
    }

    const initialState: GameState = {
      ...currentState,
      status: 'playing',
      rematchApprovals: [],
      round: 1,
      totalRounds: 1,
      dominoState: {
         turnId: starterId,
         player1Id: p1,
         player2Id: p2,
         player1Tiles: p1Hand,
         player2Tiles: p2Hand,
         boneyard: bYard,
         board: board,
         passCount: 0,
         pointsMatch: currentState.dominoState?.pointsMatch || {
           [p1]: 0,
           [p2]: 0
         }
      }
    };
    
    setState(initialState);
    broadcast({ type: 'STATE_UPDATE', state: initialState });
    updatePublicRoom(initialState.roomId, { status: 'playing' });
  };

  const startPenaltyMode = (currentState: GameState) => {
    const pIds = Object.keys(currentState.players);
    if (pIds.length < 2) return; // Need 2 players
    const p1 = pIds[0];
    const p2 = pIds[1];
    
    // reset scores
    const updatedPlayers = { ...currentState.players };
    updatedPlayers[p1] = { ...updatedPlayers[p1], score: 0 };
    updatedPlayers[p2] = { ...updatedPlayers[p2], score: 0 };

    const initialState: GameState = {
      ...currentState,
      status: 'playing',
      round: 1, // 1 to 10 (5 each)
      totalRounds: 10,
      players: updatedPlayers,
      penaltyState: {
        kickerId: p1,
        goalieId: p2,
        kickerReady: false,
        goalieReady: false,
        history: [],
        countdown: undefined
      }
    };
    
    setState(initialState);
    broadcast({ type: 'STATE_UPDATE', state: initialState });
    updatePublicRoom(initialState.roomId, { status: 'playing' });
    startPenaltyTimer();
  };

  const penaltyTimeoutRef = useRef<any>(null);

  const startPenaltyTimer = () => {
    if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);
    penaltyTimeoutRef.current = setTimeout(() => {
      // Time is up!
      const st = stateRef.current;
      if (st && st.status === 'playing' && st.gameMode === 'penalty' && st.penaltyState) {
         console.log("Penalty round timeout! Auto-choosing center for those still pending.");
         const cmds: {action: 'kicker'|'goalie', id: string}[] = [];
         if (!st.penaltyState.kickerReady) cmds.push({action: 'kicker', id: st.penaltyState.kickerId});
         if (!st.penaltyState.goalieReady) cmds.push({action: 'goalie', id: st.penaltyState.goalieId});
         
         cmds.forEach(c => handlePenaltyAction(c.id, c.action, 'center'));
      }
    }, 15000); // 15 seconds timeout per round
  };

  const handlePenaltyAction = (playerId: string, action: 'kicker' | 'goalie', dir: 'left' | 'center' | 'right') => {
    const st = stateRef.current;
    if (!st || st.status !== 'playing' || !st.penaltyState) {
      console.log("handlePenaltyAction abort: game not playing");
      return;
    }

    console.log("PENALTY_ACTION Received:", { playerId, action, dir });

    const pst = { ...st.penaltyState };
    if (action === 'kicker' && playerId === pst.kickerId && !pst.kickerReady) {
      pst.kickerDir = dir;
      pst.kickerReady = true;
    } else if (action === 'goalie' && playerId === pst.goalieId && !pst.goalieReady) {
      pst.goalieDir = dir;
      pst.goalieReady = true;
    } else {
      console.log("Invalid action or Already ready");
      return; // Do nothing if already ready or doesn't match ID
    }

    const nSt = { ...st, penaltyState: pst };
    setState(nSt);
    broadcast({ type: 'STATE_UPDATE', state: nSt });

    // evaluate if both ready
    if (nSt.penaltyState.kickerReady && nSt.penaltyState.goalieReady) {
      if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);

      const isGoal = nSt.penaltyState.kickerDir !== nSt.penaltyState.goalieDir;
      const historyEntry = { kickerId: pst.kickerId, goalieId: pst.goalieId, kickerDir: pst.kickerDir, goalieDir: pst.goalieDir, isGoal };
      const newHistory = [...pst.history, historyEntry];
      
      const upP = { ...nSt.players };
      if (isGoal) {
         upP[pst.kickerId].score += 1;
      }

      const nextRound = nSt.round + 1;
      
      const resultSt = { ...nSt, players: upP, penaltyState: { ...nSt.penaltyState, history: newHistory, kickerDir: pst.kickerDir, goalieDir: pst.goalieDir } };
      
      // Send result state so animation can play (reveal decisions)
      setState(resultSt);
      broadcast({ type: 'STATE_UPDATE', state: resultSt });

      setTimeout(() => {
         if (!stateRef.current) return;
         // Proceed next round
         if (nextRound > nSt.totalRounds) {
            // Check for sudden death if tie
            if (upP[pst.kickerId].score === upP[pst.goalieId].score) {
               // sudden death: add 2 more rounds
               const sdSt = {
                 ...resultSt,
                 totalRounds: resultSt.totalRounds + 2,
                 round: nextRound,
                 penaltyState: {
                   ...resultSt.penaltyState,
                   kickerId: pst.goalieId, // toggle
                   goalieId: pst.kickerId,
                   kickerReady: false,
                   goalieReady: false,
                   kickerDir: undefined,
                   goalieDir: undefined,
                   countdown: undefined
                 }
               };
               setState(sdSt);
               broadcast({ type: 'STATE_UPDATE', state: sdSt });
               startPenaltyTimer();
            } else {
               const finSt = { ...resultSt, status: 'finished' as const };
               setState(finSt);
               broadcast({ type: 'STATE_UPDATE', state: finSt });
               updatePublicRoom(finSt.roomId, { status: 'finished' });
            }
         } else {
            const nrSt = {
              ...resultSt,
              round: nextRound,
              penaltyState: {
                 ...resultSt.penaltyState,
                 kickerId: pst.goalieId, // toggle turn
                 goalieId: pst.kickerId,
                 kickerReady: false,
                 goalieReady: false,
                 kickerDir: undefined,
                 goalieDir: undefined,
                 countdown: undefined
              }
            };
            setState(nrSt);
            broadcast({ type: 'STATE_UPDATE', state: nrSt });
            startPenaltyTimer();
         }
      }, 3500);
    }
  };

  const startFishingMode = (currentState: GameState) => {
    let duration = 60; // default duration

    const initialState = {
      ...currentState,
      status: 'playing' as const,
      fishingTimeLeft: duration,
      fishes: [],
      caughtFishIds: []
    };
    
    setState(initialState);
    broadcast({ type: 'STATE_UPDATE', state: initialState });
    updatePublicRoom(initialState.roomId, { status: 'playing' });

    if (fishingIntervalRef.current) clearInterval(fishingIntervalRef.current);
    
    fishingIntervalRef.current = setInterval(() => {
      const state = stateRef.current;
      if (!state || state.status !== 'playing') {
        if (fishingIntervalRef.current) clearInterval(fishingIntervalRef.current);
        return;
      }
      
      const newTime = (state.fishingTimeLeft || 0) - 1;
      if (newTime <= 0) {
        if (fishingIntervalRef.current) clearInterval(fishingIntervalRef.current);
        const finalState = { ...state, status: 'finished' as const, fishingTimeLeft: 0 };
        setState(finalState);
        broadcast({ type: 'STATE_UPDATE', state: finalState });
        updatePublicRoom(finalState.roomId, { status: 'finished' });
        return;
      }
      
      const newState = { ...state, fishingTimeLeft: newTime };
      setState(newState);
      // We broadcast TIME updates every round (every 1 second)
      broadcast({ type: 'STATE_UPDATE', state: newState });
    }, 1000);
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

  const createRoom = React.useCallback((category?: string, roomVisibility: RoomVisibility = 'public', password?: string, maxPlayers: number = 10, gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino' = 'quiz') => {
    intentionalLeaveRef.current = false;
    const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const myId = `host-${Math.random().toString(36).substr(2, 9)}`;
    const username = storage.getPlayerName() || 'شبح';
    const roomCategory = gameMode === 'fishing' ? '🎣 صيد السمك' : gameMode === 'penalty' ? '⚽ ركلات الجزاء' : gameMode === 'domino' ? '🎲 الدومينو' : category || '🧠 معلومات عامة';
    
    setPlayerId(myId);
    setIsHost(true);

    const peer = createPeer(roomId);
    peerRef.current = peer;

    peer.on('open', () => {
      const initialState: GameState = {
        roomId,
        gameMode,
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
    intentionalLeaveRef.current = false;

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
        } else if (msg.type === 'FISH_CATCH' || msg.type === 'FISH_SPAWN') {
          window.dispatchEvent(new CustomEvent('fishing_event', { detail: msg }));
        }
      });
      
      conn.on('close', () => {
        if (intentionalLeaveRef.current) return;

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
    intentionalLeaveRef.current = true;

    if (!isHostRef.current && hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'LEAVE', playerId });
    }
    
    if (isHostRef.current && stateRef.current?.roomId) {
      if (Object.keys(stateRef.current.players).length <= 1) {
        deletePublicRoom(stateRef.current.roomId);
      }
    }
    
    // Clear state synchronously so that Home component doesn't try to redirect back
    setState(null);
    setIsHost(false);
    
    // Slight delay to ensure LEAVE message is sent before destroying
    setTimeout(() => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
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

  const changeGameMode = React.useCallback((gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino') => {
    if (isHostRef.current) {
      handleMessage({ type: 'CHANGE_MODE', gameMode });
    }
  }, []);

  const returnToLobby = React.useCallback(() => {
    if (isHostRef.current) {
      handleMessage({ type: 'RETURN_TO_LOBBY' });
    }
  }, []);

  const catchFish = React.useCallback((fishId: number, points: number, fType: string) => {
    if (isHostRef.current) {
      handleMessage({ type: 'FISH_CATCH', playerId, fishId, points, fType });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'FISH_CATCH', playerId, fishId, points, fType });
    }
  }, [playerId]);

  const spawnFish = React.useCallback((fish: any) => {
    if (isHostRef.current) {
      handleMessage({ type: 'FISH_SPAWN', fish });
    }
  }, []);

  const requestRematch = React.useCallback(() => {
    if (isHostRef.current) {
      handleMessage({ type: 'REQUEST_REMATCH', playerId });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'REQUEST_REMATCH', playerId });
    }
  }, [playerId]);

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

  const sendPenaltyAction = React.useCallback((action: 'kicker' | 'goalie', dir: 'left' | 'center' | 'right') => {
    if (isHostRef.current) {
      handleMessage({ type: 'PENALTY_ACTION', playerId, action, dir });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'PENALTY_ACTION', playerId, action, dir });
    }
  }, [playerId]);

  const sendDominoAction = React.useCallback((actionDetails: any) => {
    if (isHostRef.current) {
      handleMessage({ type: 'DOMINO_ACTION', playerId, actionDetails });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ type: 'DOMINO_ACTION', playerId, actionDetails });
    }
  }, [playerId]);

  return (
    <GameContext.Provider value={{ state, playerId, isHost, createRoom, joinRoom, sendMessage, toggleReady, leaveRoom, startGame, submitAnswer, kickPlayer, mutePlayer, changeCategory, changeGameMode, returnToLobby, requestRematch, forceNextQuestion, transferHost, catchFish, spawnFish, sendPenaltyAction, sendDominoAction }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
