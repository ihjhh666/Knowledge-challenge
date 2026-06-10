import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GameState, RoomPlayer, ChatMessage, PeerMessage, Question, RoomVisibility } from '../lib/types';
import { createPeer } from '../lib/peer';
import { storage } from '../lib/storage';
import { GENERAL_KNOWLEDGE_EXPANDED as GENERAL_KNOWLEDGE, FB_EXPANDED as FOOTBALL, MOVIES_EXPANDED as MOVIES, ANIME_EXPANDED as ANIME, SCI_EXPANDED as SCIENCE, HIST_EXPANDED as HISTORY, ISLAMIC_EXPANDED as ISLAMIC, MATH_EXPANDED as MATH } from '../lib/dynamicQuestions';
import { audio } from '../lib/audio';
import { supabaseService } from '../services/supabaseService';
const { createPublicRoom, updatePublicRoom, deletePublicRoom, updatePlayerStats } = supabaseService;
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
  createRoom: (category?: string, roomVisibility?: RoomVisibility, password?: string, maxPlayers?: number, gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king', subMode?: string) => void;
  joinRoom: (roomId: string, password?: string, onError?: (err: string) => void) => void;
  sendMessage: (text: string) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswer: (answer: string, timeToAnswerMs: number) => void;
  kickPlayer: (playerId: string) => void;
  mutePlayer: (playerId: string, isMuted: boolean) => void;
  changeCategory: (category: string) => void;
  changeGameMode: (gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken') => void;
  returnToLobby: () => void;
  requestRematch: () => void;
  forceNextQuestion: () => void;
  transferHost: (playerId: string) => void;
  catchFish: (fishId: number, points: number, fType: string) => void;
  spawnFish: (fish: any) => void;
  sendPenaltyAction: (action: 'kicker' | 'goalie', dir: 'left' | 'center' | 'right') => void;
  sendDominoAction: (actionDetails: any) => void;
  sendHockeyEvent: (event: any) => void;
  sendKingEvent: (event: any) => void;
  sendChickenEvent: (event: any) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setReactState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string>('');
  
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const hostConnectionRef = useRef<DataConnection | null>(null);
  const stateRef = useRef<GameState | null>(null);
  
  // Custom setState that synchronously sets the ref,
  // preventing stale closure updates on rapid successive async events.
  const setState = (newState: GameState | null) => {
     if (isHostRef.current && stateRef.current && newState) {
        const oldIds = Object.keys(stateRef.current.players);
        const newIds = Object.keys(newState.players);
        if (oldIds.length !== newIds.length) {
            console.log(`[GameContext] [setState] HOST PLAYERS COUNT CHANGED. Old:`, oldIds, `New:`, newIds);
            
            // Check who was added or removed
            const added = newIds.filter(id => !oldIds.includes(id));
            const removed = oldIds.filter(id => !newIds.includes(id));
            if (added.length > 0) {
              console.log(`[GameContext] PLAYER ADDED: ${added.map(id => `${newState.players[id]?.username} (${id})`).join(', ')}`);
            }
            if (removed.length > 0) {
              console.log(`[GameContext] PLAYER REMOVED: ${removed.map(id => `${stateRef.current?.players[id]?.username} (${id})`).join(', ')}`);
            }
        }
     }
     stateRef.current = newState;
     setReactState(newState);
  };
  
  const isHostRef = useRef<boolean>(false);
  const intentionalLeaveRef = useRef<boolean>(false);
  const fishingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimes = useRef<Record<string, number>>({});
  const lastHostPingTime = useRef<number>(Date.now());

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Cleanup on window close
  useEffect(() => {
    const handleBeforeUnload = () => {
       if (isHostRef.current && stateRef.current?.roomId) {
         deletePublicRoom(stateRef.current.roomId);
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
      const now = Date.now();
      
      if (!isHostRef.current && hostConnectionRef.current?.open) {
         hostConnectionRef.current.send({ type: 'PING', playerId });
         
         if (now - lastHostPingTime.current > 12000) {
             console.warn(`[GameContext] Host timeout detected! Marking host disconnected. Last ping: ${lastHostPingTime.current}, now: ${now}, diff: ${now - lastHostPingTime.current}`);
             hostConnectionRef.current.close();
         }
      }
      
      if (isHostRef.current && stateRef.current) {
         broadcast({ type: 'PING_HOST' });
         const players = { ...stateRef.current.players };
         
         Object.keys(players).forEach(pId => {
           if (pId !== playerId) {
              const lastPing = lastPingTimes.current[pId];
              if (lastPing && (now - lastPing > 12000)) {
                 console.warn(`[GameContext] [pingInterval] PLAYER REMOVED: ${players[pId]?.username} (${pId}) - Reason: Ping timeout > 12s. Before:`, Object.keys(players));
                 const conn = connectionsRef.current.get(pId);
                 if (conn) {
                   conn.close();
                   connectionsRef.current.delete(pId);
                 }
                 handlePlayerDisconnect(pId);
              }
           }
         });
      }
    }, 2500);
    return () => clearInterval(pingInterval);
  }, [playerId]);

  // Added disconnect delays tracking
  const disconnectDelays = useRef<Record<string, NodeJS.Timeout>>({});

  const handlePlayerDisconnect = (pId: string, intentional: boolean = false) => {
    if (!stateRef.current) return;
    const playerToRemove = stateRef.current.players[pId];
    console.warn(`[GameContext.tsx] [handlePlayerDisconnect] CONNECTION_MARKED_DISCONNECTED: ${playerToRemove?.username || 'Unknown'} (${pId}) intentional: ${intentional}`);
    
    // Clear ping time
    delete lastPingTimes.current[pId];
    
    const currentState = stateRef.current;
    
    const doRemove = () => {
        if (!stateRef.current || !stateRef.current.players[pId]) return;
        const st = stateRef.current;
        
        if (st.status === 'waiting') {
            const updatedPlayers = { ...st.players };
            delete updatedPlayers[pId];
            
            let newHockeyState = st.hockeyState;
            if (newHockeyState) {
                newHockeyState = {
                    ...newHockeyState,
                    team1: (newHockeyState.team1 || []).filter(id => id !== pId),
                    team2: (newHockeyState.team2 || []).filter(id => id !== pId)
                };
            }
            const newSt = { ...st, players: updatedPlayers, hockeyState: newHockeyState };
            setState(newSt);
            broadcast({ type: 'STATE_UPDATE', state: newSt });
            
            const pCount = Object.keys(newSt.players).length;
            if (pCount === 0) {
              deletePublicRoom(newSt.roomId);
            } else {
              updatePublicRoom(newSt.roomId, {
                playerCount: pCount
              });
            }
            return;
        }
        
        // Hande Hockey 2v2 bot substitution
        if (st.gameMode === 'hockey' && st.hockeyState?.is2v2) {
            const updatedPlayers = { ...st.players };
            const pData = updatedPlayers[pId];
            delete updatedPlayers[pId];
            
            let newHockeyState = { ...st.hockeyState };
            let botTeam: 1|2 = 1;
            
            if (newHockeyState.team1?.includes(pId)) {
                newHockeyState.team1 = newHockeyState.team1.filter(id => id !== pId);
                const botId = `bot-${Math.random().toString(36).substr(2, 5)}`;
                newHockeyState.team1.push(botId);
                botTeam = 1;
                updatedPlayers[botId] = {
                    id: botId,
                    username: `بوت (${pData?.username || ''})`, // Add old player's name as indicator
                    isHost: false,
                    isReady: true,
                    score: pData?.score || 0,
                    hasAnsweredCurrentRound: true,
                    lastAnswerSucceeded: false
                };
            } else if (newHockeyState.team2?.includes(pId)) {
                newHockeyState.team2 = newHockeyState.team2.filter(id => id !== pId);
                const botId = `bot-${Math.random().toString(36).substr(2, 5)}`;
                newHockeyState.team2.push(botId);
                botTeam = 2;
                updatedPlayers[botId] = {
                    id: botId,
                    username: `بوت (${pData?.username || ''})`, // Add old player's name as indicator
                    isHost: false,
                    isReady: true,
                    score: pData?.score || 0,
                    hasAnsweredCurrentRound: true,
                    lastAnswerSucceeded: false
                };
            }
            
            const newSt = { ...st, players: updatedPlayers, hockeyState: newHockeyState };
            setState(newSt);
            broadcast({ type: 'STATE_UPDATE', state: newSt });
            
            const pCount = Object.keys(updatedPlayers).length;
            if (pCount === 0) {
               deletePublicRoom(newSt.roomId);
            } else {
               updatePublicRoom(newSt.roomId, {
                  playerCount: pCount
               });
            }
            
            // System message
            handleMessage({
                type: 'CHAT',
                message: {
                    id: Math.random().toString(),
                    senderId: 'SYSTEM',
                    senderName: 'النظام',
                    text: `لم يعد اللاعب ${pData?.username}، تم استبداله ببوت.`,
                    timestamp: Date.now()
                }
            });
            return;
        }
        
        // Standard forfeit logic
        const playingPlayers = Object.keys(st.players).filter(key => key !== pId && !st.players[key].disconnectedAt);
        const remainingId = playingPlayers[0];
        
        const updatedPlayers = { ...st.players };
        if (remainingId && updatedPlayers[remainingId]) {
           if (st.gameMode === 'penalty' || st.gameMode === 'domino' || st.gameMode === 'hockey') {
              // Add a forfeit identifier or score
              updatedPlayers[remainingId].score += 10;
           }
        }
        const pData = updatedPlayers[pId];
        delete updatedPlayers[pId];
        
        // Check if less than 2 players remain in 2-player/1v1 modes
        const needsTwo = st.gameMode === 'penalty' || st.gameMode === 'domino' || st.gameMode === 'hockey';
        if (needsTwo && Object.keys(updatedPlayers).length < 2) {
            const finSt = { ...st, players: updatedPlayers, status: 'finished' as const };
            setState(finSt);
            broadcast({ type: 'STATE_UPDATE', state: finSt });
            
            const pCount = Object.keys(updatedPlayers).length;
            if (pCount === 0) {
               deletePublicRoom(finSt.roomId);
            } else {
               updatePublicRoom(finSt.roomId, {
                  status: 'finished',
                  playerCount: pCount
               });
            }
            
            // System message for forfeit
            handleMessage({
                type: 'CHAT',
                message: {
                    id: Math.random().toString(),
                    senderId: 'SYSTEM',
                    senderName: 'النظام',
                    text: `لم يعد اللاعب ${pData?.username}، تم احتساب الفوز للطرف الآخر.`,
                    timestamp: Date.now()
                }
            });
        } else {
            const newSt = { ...st, players: updatedPlayers };
            setState(newSt);
            broadcast({ type: 'STATE_UPDATE', state: newSt });
            
            const pCount = Object.keys(updatedPlayers).length;
            if (pCount === 0) {
                deletePublicRoom(newSt.roomId);
            } else {
                updatePublicRoom(newSt.roomId, {
                   playerCount: pCount
                });
            }
            checkAllAnswered(newSt);
            // System message for forfeit
            handleMessage({
                type: 'CHAT',
                message: {
                    id: Math.random().toString(),
                    senderId: 'SYSTEM',
                    senderName: 'النظام',
                    text: `لم يعُد اللاعب ${pData?.username}، تم استبعاده.`,
                    timestamp: Date.now()
                }
            });
        }
    };

    if (intentional) {
      if (disconnectDelays.current[pId]) {
         clearTimeout(disconnectDelays.current[pId]);
         delete disconnectDelays.current[pId];
      }
      doRemove();
      return;
    }

    // If status is waiting, add disconnectedAt and remove after 30s just like in-game
    // Only difference is what happens to the state afterwards
    const player = currentState.players[pId];
    if (player && !player.disconnectedAt) {
       const newState = {
         ...currentState,
         players: {
           ...currentState.players,
           [pId]: { ...player, disconnectedAt: Date.now() }
         }
       };
       setState(newState);
       broadcast({ type: 'STATE_UPDATE', state: newState });
       
       if (disconnectDelays.current[pId]) {
         clearTimeout(disconnectDelays.current[pId]);
       }
       
       disconnectDelays.current[pId] = setTimeout(() => {
          if (stateRef.current && stateRef.current.players[pId]?.disconnectedAt) {
             console.log(`[GameContext] [disconnectDelays] Removing player ${pId} after 30s timeout`);
             doRemove();
          }
       }, 30000); // 30 seconds grace period
    }
  };

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
    // Treat ANY message from sender as a heartbeat to prevent false disconnects
    if (senderId) {
      if (isHostRef.current) {
        lastPingTimes.current[senderId] = Date.now();
        if (message.type === 'PING') {
            // console.log(`[GameContext] PING_RECEIVED from ${senderId}`);
        }
        
        // CONNECTION_RESTORED: If we receive any message from a player marked as disconnected, restore them automatically!
        if (stateRef.current && stateRef.current.players[senderId]?.disconnectedAt) {
            console.warn(`[GameContext] CONNECTION_RESTORED for ${senderId} due to incoming message of type ${message.type}`);
            if (disconnectDelays.current[senderId]) {
                clearTimeout(disconnectDelays.current[senderId]);
                delete disconnectDelays.current[senderId];
            }
            const newState = {
                ...stateRef.current,
                players: {
                    ...stateRef.current.players,
                    [senderId]: {
                        ...stateRef.current.players[senderId],
                        disconnectedAt: undefined
                    }
                }
            };
            delete newState.players[senderId].disconnectedAt; // Ensure it's removed
            setState(newState);
            broadcast({ type: 'STATE_UPDATE', state: newState });
        }

      } else if (stateRef.current && stateRef.current.players[senderId]?.isHost) {
        lastHostPingTime.current = Date.now();
      }
    } else if (!isHostRef.current && message.type === 'PING_HOST') {
        const hostId = stateRef.current ? (Object.values(stateRef.current.players) as RoomPlayer[]).find(p => p.isHost)?.id : null;
        if (hostId) {
            lastHostPingTime.current = Date.now();
        }
    }

    if (message.type === 'PING_HOST') {
        if (!isHostRef.current) {
           console.log(`[GameContext] PING_HOST_RECEIVED. Marking host active.`);
           lastHostPingTime.current = Date.now();
        }
    }

    // 1. Permissions (Host Authority)
    const hostOnlyActions = [
      'START_GAME',
      'KICK',
      'CHANGE_CATEGORY',
      'CHANGE_MODE',
      'CHANGE_HOCKEY_MODE',
      'ADD_BOT',
      'REMOVE_BOT',
      'RETURN_TO_LOBBY',
      'FORCE_NEXT_QUESTION',
      'TRANSFER_HOST',
      'MUTE',
      'FISH_SPAWN',
      'HOCKEY_SYNC',
      'KING_SYNC',
      'CHICKEN_SYNC'
    ];

    if (isHostRef.current && senderId && hostOnlyActions.includes(message.type)) {
         console.warn(`[GameContext] Unauthorized action ${message.type} from player ${senderId}. Only host controls this.`);
         return;
    }

    switch (message.type) {
      case 'STATE_UPDATE':
        if (stateRef.current?.status === 'waiting' && message.state.status === 'playing') {
          console.log(`[GameContext] CLIENT_RECEIVED_STATE: Transitioning from waiting to playing! Players:`, Object.keys(message.state.players));
          audio.startGame();
        } else {
          console.log(`[GameContext] CLIENT_RECEIVED_STATE: updating game state. Status: ${message.state.status}, Players:`, Object.keys(message.state.players));
        }
        setState(message.state);
        break;
      case 'NEW_QUESTION':
        console.log(`[GameContext] QUESTION_SYNC_RECEIVED: Forcing state to playing and setting question`);
        if (stateRef.current) {
          const forceState = { 
            ...stateRef.current, 
            status: message.status as any, 
            currentQuestion: message.question,
            round: message.round,
            roundStartTime: message.roundStartTime
          };
          setState(forceState);
        }
        break;
      case 'JOIN':
        if (isHostRef.current && stateRef.current) {
          console.log(`[GameContext] HOST_RECEIVED_JOIN_REQUEST: ${message.player.username} (${message.player.id})`);
          console.log(`[GameContext] HOST PLAYERS BEFORE UPDATE:`, Object.keys(stateRef.current.players));
          lastPingTimes.current[message.player.id] = Date.now();
          const conn = senderId ? connectionsRef.current.get(senderId) : null;
          
          if (stateRef.current.roomVisibility === 'password' && message.password !== stateRef.current.password) {
            if (conn) {
              conn.send({ type: 'JOIN_REJECTED', reason: 'كلمة المرور غير صحيحة' });
              setTimeout(() => conn.close(), 500);
            }
            break;
          }

          // Check if reconnecting
          const reconnectingOldId = Object.keys(stateRef.current.players).find(
            k => stateRef.current.players[k].userId === message.player.userId
          );

          if (reconnectingOldId) {
             const oldId = reconnectingOldId;
             const newId = message.player.id;
             console.log(`[GameContext] HOST_RECONNECTING_PLAYER: Old ID ${oldId} -> New ID ${newId}`);
             
             if (disconnectDelays.current[oldId]) {
                clearTimeout(disconnectDelays.current[oldId]);
                delete disconnectDelays.current[oldId];
             }
             
             const newState = JSON.parse(JSON.stringify(stateRef.current)) as GameState;
             
             const pData = newState.players[oldId];
             delete newState.players[oldId];
             pData.id = newId;
             delete pData.disconnectedAt;
             newState.players[newId] = pData;
             
             if (newState.penaltyState) {
                if (newState.penaltyState.kickerId === oldId) newState.penaltyState.kickerId = newId;
                if (newState.penaltyState.goalieId === oldId) newState.penaltyState.goalieId = newId;
                newState.penaltyState.history.forEach(h => {
                   if (h.kickerId === oldId) h.kickerId = newId;
                   if (h.goalieId === oldId) h.goalieId = newId;
                });
             }
             if (newState.dominoState) {
                if (newState.dominoState.turnId === oldId) newState.dominoState.turnId = newId;
                if (newState.dominoState.player1Id === oldId) newState.dominoState.player1Id = newId;
                if (newState.dominoState.player2Id === oldId) newState.dominoState.player2Id = newId;
                if (newState.dominoState.winnerId === oldId) newState.dominoState.winnerId = newId;
                if (newState.dominoState.pointsMatch && newState.dominoState.pointsMatch[oldId] !== undefined) {
                   newState.dominoState.pointsMatch[newId] = newState.dominoState.pointsMatch[oldId];
                   delete newState.dominoState.pointsMatch[oldId];
                }
             }
             if (newState.hockeyState) {
                if (newState.hockeyState.player1Id === oldId) newState.hockeyState.player1Id = newId;
                if (newState.hockeyState.player2Id === oldId) newState.hockeyState.player2Id = newId;
                if (newState.hockeyState.team1) {
                   newState.hockeyState.team1 = newState.hockeyState.team1.map((id: string) => id === oldId ? newId : id);
                }
                if (newState.hockeyState.team2) {
                   newState.hockeyState.team2 = newState.hockeyState.team2.map((id: string) => id === oldId ? newId : id);
                }
                if (newState.hockeyState.pointsMatch && newState.hockeyState.pointsMatch[oldId] !== undefined) {
                   newState.hockeyState.pointsMatch[newId] = newState.hockeyState.pointsMatch[oldId];
                   delete newState.hockeyState.pointsMatch[oldId];
                }
             }
             
             setState(newState);
             console.log(`[GameContext] HOST_BROADCASTED_STATE after reconnect. Players:`, Object.keys(newState.players));
             broadcast({ type: 'STATE_UPDATE', state: newState });
             
             // System message
             handleMessage({
                 type: 'CHAT',
                 message: {
                     id: Math.random().toString(),
                     senderId: 'SYSTEM',
                     senderName: 'النظام',
                     text: `تمت إعادة اتصال اللاعب ${pData.username} بنجاح.`,
                     timestamp: Date.now()
                 }
             });
             break;
          }

          if (stateRef.current.status !== 'waiting') {
             if (conn) {
                conn.send({ type: 'JOIN_REJECTED', reason: 'المباراة جارية بالفعل ولا يمكنك الانضمام الآن.' });
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

          let newHockeyState = stateRef.current.hockeyState;
          if (stateRef.current.gameMode === 'hockey' && stateRef.current.hockeyState?.is2v2) {
              const t1 = [...(stateRef.current.hockeyState.team1 || [])];
              const t2 = [...(stateRef.current.hockeyState.team2 || [])];
              if (t1.length < 2) t1.push(message.player.id);
              else if (t2.length < 2) t2.push(message.player.id);
              newHockeyState = { ...stateRef.current.hockeyState, team1: t1, team2: t2 };
          }

          const newState = {
            ...stateRef.current,
            hockeyState: newHockeyState,
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
          
          console.log(`[GameContext] HOST_ADDED_PLAYER: ${message.player.username} (${message.player.id})`);
          setState(newState);
          console.log(`[GameContext] HOST_BROADCASTED_STATE after join`);
          broadcast({ type: 'STATE_UPDATE', state: newState });
          console.log(`[GameContext] HOST PLAYERS AFTER UPDATE:`, Object.keys(newState.players));
          
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
          } else if (currentState.gameMode === 'hockey') {
            startHockeyMode(currentState);
          } else if (currentState.gameMode === 'king') {
            startKingMode(currentState);
          } else if (currentState.gameMode === 'chicken') {
            startChickenMode(currentState);
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
      case 'HOCKEY_ACTION':
      case 'HOCKEY_SYNC':
      case 'HOCKEY_RESTART':
        if (stateRef.current && stateRef.current.gameMode === 'hockey') {
          if (isHostRef.current) {
             broadcast(message);
          }
          window.dispatchEvent(new CustomEvent('hockey_event', { detail: message }));
        }
        break;
      case 'KING_INPUT':
      case 'KING_SYNC':
        if (stateRef.current && stateRef.current.gameMode === 'king') {
          if (isHostRef.current && message.type === 'KING_SYNC') {
            broadcast(message);
          }
          window.dispatchEvent(new CustomEvent('king_event', { detail: message }));
        }
        break;
      case 'CHICKEN_INPUT':
      case 'CHICKEN_SYNC':
        if (stateRef.current && stateRef.current.gameMode === 'chicken') {
          if (isHostRef.current && message.type === 'CHICKEN_SYNC') {
            broadcast(message);
          }
          window.dispatchEvent(new CustomEvent('chicken_event', { detail: message }));
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
           let newHockeyState = stateRef.current.hockeyState;
           if (newHockeyState) {
              newHockeyState = {
                  ...newHockeyState,
                  team1: (newHockeyState.team1 || []).filter(id => id !== message.playerId),
                  team2: (newHockeyState.team2 || []).filter(id => id !== message.playerId)
              };
           }
           const newState = { ...stateRef.current, players: remainingPlayers, hockeyState: newHockeyState };
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
      case 'CHANGE_HOCKEY_MODE':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting' && stateRef.current.gameMode === 'hockey') {
           const is2v2 = message.is2v2;
           console.log('[DEBUG] ROOM CREATED: Hockey Mode', is2v2 ? '2v2' : '1v1');
           const newCat = is2v2 ? '🏒 هوكي (2 ضد 2)' : '🏒 هوكي (1 ضد 1)';
           let t1 = is2v2 ? [] : undefined;
           let t2 = is2v2 ? [] : undefined;
           if (is2v2) {
               Object.keys(stateRef.current.players).forEach(pId => {
                   if (t1.length < 2) t1.push(pId);
                   else if (t2.length < 2) t2.push(pId);
               });
           }
           const newState = { 
               ...stateRef.current, 
               category: newCat,
               hockeyState: {
                   ...stateRef.current.hockeyState,
                   is2v2,
                   team1: t1,
                   team2: t2,
               }
           };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, { category: newCat });
        }
        break;
      case 'ASSIGN_TEAM':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const team = message.team;
           const pId = message.pId;
           
           let t1 = [...(stateRef.current.hockeyState?.team1 || [])];
           let t2 = [...(stateRef.current.hockeyState?.team2 || [])];
           
           t1 = t1.filter(id => id !== pId);
           t2 = t2.filter(id => id !== pId);
           
           if ((team as any) === 'team1' || team === 1) {
              if (t1.length < 2) t1.push(pId);
           }
           if ((team as any) === 'team2' || team === 2) {
              if (t2.length < 2) t2.push(pId);
           }
           
           console.log(`[DEBUG] TEAM ASSIGNED: Player ${pId} joined Team ${team}`);
           
           const newState = {
               ...stateRef.current,
               hockeyState: {
                   ...stateRef.current.hockeyState,
                   team1: t1,
                   team2: t2
               }
           };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
        }
        break;
      case 'ADD_BOT':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const team = message.team;
           let t1 = [...(stateRef.current.hockeyState?.team1 || [])];
           let t2 = [...(stateRef.current.hockeyState?.team2 || [])];
           
           const botId = `bot-${Math.random().toString(36).substring(2, 9)}`;
           
           // Also add bot to the global players so lobby displays it
           const newPlayers = { ...stateRef.current.players };
           newPlayers[botId] = {
               id: botId,
               username: 'بوت',
               score: 0,
               isHost: false,
               isReady: true,
               hasAnsweredCurrentRound: false,
               lastAnswerSucceeded: false
           };
           
           if ((team as any) === 'team1' || team === 1) {
              if (t1.length < 2) t1.push(botId);
           } else if ((team as any) === 'team2' || team === 2) {
              if (t2.length < 2) t2.push(botId);
           }
           
           console.log(`[DEBUG] BOT CREATED: ${botId} in Team ${team}`);
           
           const newState = {
               ...stateRef.current,
               players: newPlayers,
               hockeyState: {
                   ...stateRef.current.hockeyState,
                   team1: t1,
                   team2: t2
               }
           };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
        }
        break;
      case 'REMOVE_BOT':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const botId = message.botId;
           let t1 = [...(stateRef.current.hockeyState?.team1 || [])].filter(id => id !== botId);
           let t2 = [...(stateRef.current.hockeyState?.team2 || [])].filter(id => id !== botId);
           
           const newPlayers = { ...stateRef.current.players };
           delete newPlayers[botId];
           
           const newState = {
               ...stateRef.current,
               players: newPlayers,
               hockeyState: {
                   ...stateRef.current.hockeyState,
                   team1: t1,
                   team2: t2
               }
           };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
        }
        break;
      case 'CHANGE_MODE':
        if (isHostRef.current && stateRef.current && stateRef.current.status === 'waiting') {
           const newCat = message.gameMode === 'fishing' ? '🎣 صيد السمك' : message.gameMode === 'penalty' ? '⚽ ركلات الجزاء' : message.gameMode === 'domino' ? '🎲 الدومينو' : message.gameMode === 'hockey' ? '🏒 هوكي' : '🧠 معلومات عامة';
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
          broadcast({ type: 'STATE_UPDATE', state: newState });
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
           handlePlayerDisconnect(message.playerId, true);
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
                    if (connectionsRef.current.get(c.peer) === c) {
                        connectionsRef.current.delete(c.peer);
                        setTimeout(() => {
                           if (stateRef.current && stateRef.current.players[c.peer] && !connectionsRef.current.has(c.peer)) {
                              handlePlayerDisconnect(c.peer);
                           }
                        }, 5000);
                    } else {
                        console.warn(`[GameContext] IGNORING 'close' for peer ${c.peer} because we have a newer active connection for them.`);
                    }
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
      case 'PING_HOST':
        if (!isHostRef.current) {
           lastHostPingTime.current = Date.now();
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

  const startKingMode = (currentState: GameState) => {
    const updatedPlayers = { ...currentState.players };
    Object.values(updatedPlayers).forEach(p => p.score = 0);
    const newState: GameState = {
      ...currentState,
      status: 'playing',
      players: updatedPlayers
    };
    setState(newState);
    broadcast({ type: 'STATE_UPDATE', state: newState });
    updatePublicRoom(newState.roomId, { status: 'playing' });
  };

  const startChickenMode = (currentState: GameState) => {
    const updatedPlayers = { ...currentState.players };
    Object.values(updatedPlayers).forEach(p => p.score = 0);
    const newState: GameState = {
      ...currentState,
      status: 'playing',
      players: updatedPlayers
    };
    setState(newState);
    broadcast({ type: 'STATE_UPDATE', state: newState });
    updatePublicRoom(newState.roomId, { status: 'playing' });
  };

  const startHockeyMode = (currentState: GameState) => {
    const pIds = Object.keys(currentState.players);
    if (pIds.length < (currentState.subMode === '2v2' ? 1 : 2)) return;
    
    // reset scores
    const updatedPlayers = { ...currentState.players };
    pIds.forEach(id => {
       updatedPlayers[id] = { ...updatedPlayers[id], score: 0 };
    });

    let hockeyState: any = {};
    
    if (currentState.subMode === '2v2') {
       let team1 = [...(currentState.hockeyState?.team1 || [])];
       let team2 = [...(currentState.hockeyState?.team2 || [])];
       
       // Fill missing slots with bots if they aren't fully 4 players
       const all = [...pIds].filter(id => !team1.includes(id) && !team2.includes(id)).sort(() => Math.random() - 0.5);
       
       for (let i = 0; i < 4; i++) {
           let newId: string | undefined;
           let tName = '';
           if (team1.length < 2) {
               newId = all.pop() || `bot-${Math.random().toString(36).substring(2, 9)}`;
               team1.push(newId);
               tName = 'Team 1';
           } else if (team2.length < 2) {
               newId = all.pop() || `bot-${Math.random().toString(36).substring(2, 9)}`;
               team2.push(newId);
               tName = 'Team 2';
           }
           if (newId && newId.startsWith('bot-') && !updatedPlayers[newId]) {
               console.log(`[DEBUG] BOT CREATED: ${newId} in ${tName} (Auto-fill)`);
               updatedPlayers[newId] = {
                   id: newId,
                   username: 'بوت (حاسوب)',
                   score: 0,
                   isHost: false,
                   isReady: true,
                   hasAnsweredCurrentRound: false,
                   lastAnswerSucceeded: false
               };
           }
       }
       
       console.log('[DEBUG] TEAMS ASSIGNED:', 'Team 1:', team1, 'Team 2:', team2);
       
       hockeyState = {
         is2v2: true,
         team1,
         team2,
         player1Id: team1[0], 
         player2Id: team2[0]
       };
    } else {
       const p1 = pIds[0];
       const p2 = pIds[1];
       hockeyState = {
         is2v2: false,
         player1Id: p1,
         player2Id: p2,
       };
    }

    const initialState: GameState = {
      ...currentState,
      status: 'playing',
      round: 1,
      totalRounds: 1,
      players: updatedPlayers,
      hockeyState
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
    console.log(`[GameContext] START_GAME_TRIGGERED - Generating new question and preparing to broadcast state...`);
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
    console.log(`[GameContext] STATE_UPDATE_SENT - status: playing, question: ${newState.currentQuestion?.text.substring(0, 20)}...`);
    broadcast({ type: 'STATE_UPDATE', state: newState });
    
    // Optional: send explicit QUESTION_SYNC to guarantee transition
    console.log(`[GameContext] QUESTION_SYNC_SENT - broadcasting individual question update...`);
    broadcast({ type: 'NEW_QUESTION', question: newState.currentQuestion, status: 'playing', round: nextRound, roundStartTime: newState.roundStartTime! });

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

  const createRoom = React.useCallback((category?: string, roomVisibility: RoomVisibility = 'public', password?: string, maxPlayers: number = 10, gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken' = 'quiz', subMode?: string) => {
    intentionalLeaveRef.current = false;
    const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const myId = `host-${Math.random().toString(36).substr(2, 9)}`;
    const username = storage.getPlayerName() || 'شبح';
    const roomCategory = gameMode === 'king' ? '👑 طور الملك' : gameMode === 'fishing' ? '🎣 صيد السمك' : gameMode === 'penalty' ? '⚽ ركلات الجزاء' : gameMode === 'domino' ? '🎲 الدومينو' : gameMode === 'hockey' ? (subMode === '2v2' ? '🏒 هوكي 2 ضد 2' : '🏒 هوكي 1 ضد 1') : category || '🧠 معلومات عامة';
    
    setPlayerId(myId);
    setIsHost(true);

    const peer = createPeer(roomId);
    peerRef.current = peer;

    peer.on('open', () => {
      const initialState: GameState = {
        roomId,
        gameMode,
        subMode,
        category: roomCategory,
        roomVisibility,
        maxPlayers,
        password,
        status: 'waiting',
        round: 0,
        totalRounds: 10,
        players: {
          [myId]: { id: myId, userId: storage.getPlayerId(), username, avatarUrl: storage.getPlayerAvatar(), isReady: true, isHost: true, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false }
        },
        messages: [],
        askedQuestions: [],
        hockeyState: gameMode === 'hockey' ? {
           is2v2: subMode === '2v2',
           team1: subMode === '2v2' ? [myId] : [],
           team2: [],
           player1Id: myId,
           player2Id: ''
        } : undefined
      };
      setState(initialState);
      audio.joinLobby();
      
      // Save all rooms to Firebase so we can debug, but firebase.ts filter decides what shows
      createPublicRoom({
        roomId,
        hostName: username,
        category: roomCategory,
        gameMode,
        playerCount: 1,
        maxPlayers,
        roomVisibility,
        status: 'waiting',
        createdAt: Date.now()
      });
    });

    peer.on('connection', (conn) => {
      connectionsRef.current.set(conn.peer, conn);
      
      conn.on('data', (data) => {
        handleMessage(data as PeerMessage, conn.peer);
      });
      
      conn.on('close', () => {
        console.warn(`[GameContext] CONNECTION_MARKED_DISCONNECTED for peer ${conn.peer}. Triggered by PeerJS conn.on('close').`);
        if (connectionsRef.current.get(conn.peer) === conn) {
            connectionsRef.current.delete(conn.peer);
            
            // Give 5 seconds grace period for auto-reconnect before triggering UI popup
            setTimeout(() => {
                if (stateRef.current && stateRef.current.players[conn.peer] && !connectionsRef.current.has(conn.peer)) {
                   console.log(`[GameContext] Peer ${conn.peer} did not reconnect in 5s, triggering disconnect.`);
                   handlePlayerDisconnect(conn.peer);
                }
            }, 5000);
        } else {
            console.warn(`[GameContext] IGNORING 'close' for peer ${conn.peer} because we have a newer active connection for them.`);
        }
      });
      
      conn.on('error', (err) => {
         console.error('Host connection error:', err);
      });
    });

    peer.on('error', (err: any) => {
      console.error('Host peer error:', err);
      // Wait for disconnected event or try to reconnect if network error
      if (err.type === 'network') {
         if (!peer.destroyed) peer.reconnect();
      }
    });

    peer.on('disconnected', () => {
       console.log('Host disconnected from signaling server, reconnecting...');
       if (!peer.destroyed) {
         peer.reconnect();
       }
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
        lastHostPingTime.current = Date.now(); // Reset ping timeout so we don't migrate instantly
        conn.send({
          type: 'JOIN',
          player: { id: myId, userId: storage.getPlayerId(), username, avatarUrl: storage.getPlayerAvatar(), isReady: false, isHost: false, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false },
          password
        });
        audio.joinLobby();
      });

      let rejectedReason: string | null = null;
      conn.on('data', (data) => {
        const msg = data as PeerMessage;
        
        if (msg.type === 'STATE_UPDATE') {
          if (stateRef.current?.status === 'waiting' && msg.state.status === 'playing') {
            console.log(`[GameContext] CLIENT_RECEIVED_STATE: Transitioning from waiting to playing! Players:`, Object.keys(msg.state.players));
            audio.startGame();
          } else {
            console.log(`[GameContext] CLIENT_RECEIVED_STATE: updating game state. (Status: ${msg.state.status}), Players:`, Object.keys(msg.state.players));
          }
          if (!msg.state.players[myId]) {
            console.warn(`[GameContext] PLAYER_CONNECTED_BUT_NOT_IN_STATE: I am connected but my ID (${myId}) is missing from players array!`);
          }
          setState(msg.state);
        } else if (msg.type === 'NEW_QUESTION') {
          console.log(`[GameContext] QUESTION_SYNC_RECEIVED: Forcing state to playing and setting question`);
          if (stateRef.current) {
            const forceState = { 
              ...stateRef.current, 
              status: msg.status as any, 
              currentQuestion: msg.question,
              round: msg.round,
              roundStartTime: msg.roundStartTime
            };
            setState(forceState);
          }
        } else if (msg.type === 'JOIN_REJECTED') {
          rejectedReason = msg.reason;
          if (onError) onError(msg.reason);
          conn.close();
        } else if (msg.type === 'KICKED') {
          alert(msg.reason || 'لقد تم طردك من الغرفة.');
          conn.close();
        } else if (msg.type === 'FISH_CATCH' || msg.type === 'FISH_SPAWN') {
          window.dispatchEvent(new CustomEvent('fishing_event', { detail: msg }));
        } else if (msg.type === 'HOCKEY_ACTION' || msg.type === 'HOCKEY_SYNC' || msg.type === 'HOCKEY_RESTART') {
          window.dispatchEvent(new CustomEvent('hockey_event', { detail: msg }));
        } else if (msg.type === 'KING_SYNC' || msg.type === 'KING_INPUT') {
          window.dispatchEvent(new CustomEvent('king_event', { detail: msg }));
        } else if (msg.type === 'CHICKEN_SYNC' || msg.type === 'CHICKEN_INPUT') {
          window.dispatchEvent(new CustomEvent('chicken_event', { detail: msg }));
        }
      });
      
      conn.on('close', () => {
        console.warn(`[GameContext] CONNECTION_MARKED_DISCONNECTED for peer ${conn.peer}. Triggered by PeerJS conn.on('close') on client side.`);
        if (intentionalLeaveRef.current) return;
        
        if (hostConnectionRef.current && hostConnectionRef.current !== conn) {
            console.warn(`[GameContext] IGNORING host 'close' because we have a newer active connection to the host.`);
            return;
        }

        const oldState = stateRef.current;
        if (oldState && !rejectedReason) {
           if (oldState.status === 'playing' || oldState.status === 'revealing') {
               console.log('Host connection dropped during game. Trying to reconnect...');
               const hostId = Object.keys(oldState.players).find(k => oldState.players[k].isHost);
               if (hostId) {
                   const newState = {
                       ...oldState,
                       players: {
                           ...oldState.players,
                           [hostId]: { ...oldState.players[hostId], disconnectedAt: Date.now() }
                       }
                   };
                   setState(newState);
                   stateRef.current = newState;
               }

               setTimeout(() => {
                   if (intentionalLeaveRef.current) return;
                   joinRoom(roomId, password, onError);
               }, 2000);
               return; // Prevent normal close handling (migrating or failing instantly)
           }

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
                    
                    let newState = { ...oldState, players: updatedPlayers };
                    const needsTwo = newState.gameMode === 'penalty' || newState.gameMode === 'domino' || newState.gameMode === 'hockey';
                    if (needsTwo && newState.status === 'playing' && Object.keys(updatedPlayers).length < 2) {
                        if (updatedPlayers[myId]) {
                            updatedPlayers[myId].score += 10;
                        }
                        newState.status = 'finished';
                    }
                    
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
                       if (connectionsRef.current.get(c.peer) === c) {
                           connectionsRef.current.delete(c.peer);
                           setTimeout(() => {
                               if (stateRef.current && stateRef.current.players[c.peer] && !connectionsRef.current.has(c.peer)) {
                                  handlePlayerDisconnect(c.peer);
                               }
                           }, 5000);
                       } else {
                           console.warn(`[GameContext] IGNORING 'close' for peer ${c.peer} because we have a newer active connection for them.`);
                       }
                    });
                    c.on('error', (err) => console.error('New host conn error:', err));
                    
                    c.on('open', () => {
                      // Send current state to newly rejoined peers
                      if (stateRef.current) c.send({ type: 'STATE_UPDATE', state: stateRef.current });
                    });
                 });
                 newPeer.on('error', (err: any) => {
                    console.error('New host peer error:', err);
                    if (err.type === 'network') {
                       if (!newPeer.destroyed) newPeer.reconnect();
                    }
                 });
                 newPeer.on('disconnected', () => {
                    console.log('New host disconnected from server, reconnecting...');
                    if (!newPeer.destroyed) {
                       newPeer.reconnect();
                    }
                 });
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
      
      if (err.type === 'network') {
         if (!peer.destroyed) peer.reconnect();
         return; // Don't show error immediately, try to reconnect
      }

      setTimeout(() => {
        if (!stateRef.current) {
          if (onError) onError('تعذر الاتصال بالغرفة - قد يكون المضيف غادر');
        }
      }, 500);
      setState(null);
    });

    peer.on('disconnected', () => {
      console.log('Client disconnected from server, reconnecting...');
      if (!peer.destroyed) {
         peer.reconnect();
      }
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
      // If host leaves, the room is effectively destroyed. Delete it from Supabase.
      deletePublicRoom(stateRef.current.roomId);
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

  const changeGameMode = React.useCallback((gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken') => {
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

  const sendHockeyEvent = React.useCallback((event: any) => {
    if (isHostRef.current) {
      handleMessage({ ...event, playerId });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ ...event, playerId });
    }
  }, [playerId]);

  const sendKingEvent = React.useCallback((event: any) => {
    if (isHostRef.current) {
      handleMessage({ ...event, playerId });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ ...event, playerId });
    }
  }, [playerId]);

  const sendChickenEvent = React.useCallback((event: any) => {
    if (isHostRef.current) {
      handleMessage({ ...event, playerId });
    } else if (hostConnectionRef.current?.open) {
      hostConnectionRef.current.send({ ...event, playerId });
    }
  }, [playerId]);

  const disconnectedPlayer = state && (state.status === 'playing' || state.status === 'revealing' || state.status === 'waiting') 
    ? (Object.values(state.players) as RoomPlayer[]).find(p => p.disconnectedAt) 
    : undefined;
    
  const [disconnectCountdown, setDisconnectCountdown] = useState(30);
  
  useEffect(() => {
     let interval: any;
     if (disconnectedPlayer && disconnectedPlayer.disconnectedAt) {
         interval = setInterval(() => {
             const elapsed = Date.now() - disconnectedPlayer.disconnectedAt!;
             const rem = Math.max(0, 30 - Math.floor(elapsed / 1000));
             setDisconnectCountdown(rem);
             
             if (rem === 0 && isHostRef.current && stateRef.current && stateRef.current.status === 'playing') {
                 clearInterval(interval);
                 const currentState = stateRef.current;
                 const pId = disconnectedPlayer.id;
                 
                 // End game, others win
                 const updatedPlayers = { ...currentState.players };
                 Object.values(updatedPlayers).forEach((p: any) => {
                     if (p.id !== pId) {
                         p.score += 10;
                         // Persist free win stats for players.
                         updatePlayerStats(p.userId || p.id, p.username, true, 0, 0, 10, currentState.category || 'عام');
                     } else {
                         // Loser stats
                         updatePlayerStats(p.userId || p.id, p.username, false, 0, 0, 0, currentState.category || 'عام');
                     }
                 });
                 const newState: GameState = { ...currentState, players: updatedPlayers, status: 'finished' };
                 setState(newState);
                 broadcast({ type: 'STATE_UPDATE', state: newState });
             }
         }, 500);
     }
     return () => clearInterval(interval);
  }, [disconnectedPlayer]);

  return (
    <GameContext.Provider value={{ state, playerId, isHost, createRoom, joinRoom, sendMessage, toggleReady, leaveRoom, startGame, submitAnswer, kickPlayer, mutePlayer, changeCategory, changeGameMode, returnToLobby, requestRematch, forceNextQuestion, transferHost, catchFish, spawnFish, sendPenaltyAction, sendDominoAction, sendHockeyEvent, sendKingEvent, sendChickenEvent }}>
      {children}
      {disconnectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
              <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">انقطاع الاتصال</h2>
                 <p className="text-gray-600 dark:text-gray-300 font-medium">
                    تم فقدان اتصال اللاعب <span className="font-bold text-indigo-500">{disconnectedPlayer.username}</span>، جاري انتظار إعادة الاتصال...
                 </p>
              </div>
              <div className="text-5xl font-black text-indigo-500">
                 {disconnectCountdown}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                 ستنتهي المباراة تلقائياً إذا لم يعد.
              </p>
           </div>
        </div>
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
