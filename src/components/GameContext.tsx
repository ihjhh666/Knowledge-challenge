import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GameState, RoomPlayer, ChatMessage, PeerMessage, Question } from '../lib/types';
import { createPeer } from '../lib/peer';
import { storage } from '../lib/storage';
import { GENERAL_KNOWLEDGE, FOOTBALL, MOVIES, ANIME, SCIENCE, HISTORY, ISLAMIC } from '../lib/questionData';
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
  ...ISLAMIC
];

interface GameContextType {
  state: GameState | null;
  playerId: string;
  isHost: boolean;
  createRoom: (category?: string) => void;
  joinRoom: (roomId: string, onError?: (err: string) => void) => void;
  sendMessage: (text: string) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswer: (answer: string, timeToAnswerMs: number) => void;
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

  // Sync state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  const broadcast = (message: PeerMessage) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
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
          const playerName = message.player.username;
          // Add player
          const newState = {
            ...stateRef.current,
            players: {
              ...stateRef.current.players,
              [message.player.id]: {
                ...message.player,
                hasAnsweredCurrentRound: false,
                lastAnswerSucceeded: false
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

    const q = questionsPool[Math.floor(Math.random() * questionsPool.length)];
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

    const allAnswered = (Object.values(updatedPlayers) as RoomPlayer[]).every(p => p.hasAnsweredCurrentRound);

    if (allAnswered) {
      // Move to revealing
      const revealingState: GameState = {
        ...currentState,
        status: 'revealing',
        players: updatedPlayers
      };
      setState(revealingState);
      broadcast({ type: 'STATE_UPDATE', state: revealingState });

      // Automatically go to next round after 3 seconds
      setTimeout(() => {
        if (stateRef.current) {
          startNextRound(stateRef.current);
        }
      }, 3000);
    } else {
      const newState = { ...currentState, players: updatedPlayers };
      setState(newState);
      broadcast({ type: 'STATE_UPDATE', state: newState });
    }
  };

  const createRoom = React.useCallback((category?: string) => {
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
        status: 'waiting',
        round: 0,
        totalRounds: 10,
        players: {
           [myId]: { id: myId, username, isReady: true, isHost: true, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false }
        },
        messages: []
      };
      setState(initialState);
      audio.joinLobby();
      
      // Save Public Room to Firebase
      createPublicRoom({
        roomId,
        hostName: username,
        category: roomCategory,
        playerCount: 1,
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
        connectionsRef.current.delete(conn.peer);
        // Remove player on disconnect
        if (stateRef.current) {
           const { [conn.peer]: _, ...remainingPlayers } = stateRef.current.players;
           const newState = { ...stateRef.current, players: remainingPlayers };
           setState(newState);
           broadcast({ type: 'STATE_UPDATE', state: newState });
           updatePublicRoom(newState.roomId, {
             playerCount: Object.keys(newState.players).length
           });
        }
      });
      
      conn.on('error', (err) => {
         console.error('Host connection error:', err);
      });
    });

    peer.on('error', (err) => {
      console.error('Host peer error:', err);
    });
  }, []);

  const joinRoom = React.useCallback((roomId: string, onError?: (err: string) => void) => {
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
          player: { id: myId, username, isReady: false, isHost: false, score: 0, hasAnsweredCurrentRound: false, lastAnswerSucceeded: false }
        });
        audio.joinLobby();
      });

      conn.on('data', (data) => {
        const msg = data as PeerMessage;
        if (msg.type === 'STATE_UPDATE') {
          setState(msg.state);
        }
      });
      
      conn.on('close', () => {
        setState(null);
        if (onError) onError('انقطع الاتصال بالغرفة');
      });
      
      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setState(null);
        if (onError) onError('حدث خطأ في الاتصال بالغرفة');
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setTimeout(() => {
        if (!stateRef.current) {
          if (onError) onError('تعذر الاتصال بالغرفة ' + roomId);
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
    if (isHostRef.current && stateRef.current?.roomId) {
      deletePublicRoom(stateRef.current.roomId);
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setState(null);
    setIsHost(false);
    setPlayerId('');
    connectionsRef.current.clear();
    hostConnectionRef.current = null;
  }, []);

  return (
    <GameContext.Provider value={{ state, playerId, isHost, createRoom, joinRoom, sendMessage, toggleReady, leaveRoom, startGame, submitAnswer }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
