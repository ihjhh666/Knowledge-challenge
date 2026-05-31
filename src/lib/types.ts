export type RoomStatus = 'waiting' | 'playing' | 'revealing' | 'finished';

export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface RoomPlayer {
  id: string; // The peer JS ID or a random ID if host
  username: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  hasAnsweredCurrentRound: boolean;
  lastAnswerSucceeded: boolean;
  lastAnswerTime?: number;
  isMuted?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export type RoomVisibility = 'public' | 'private' | 'link' | 'password';

export interface GameState {
  roomId: string;
  category?: string;
  gameMode?: 'quiz' | 'fishing';
  roomVisibility?: RoomVisibility;
  maxPlayers?: number;
  password?: string;
  status: RoomStatus;
  players: Record<string, RoomPlayer>;
  messages: ChatMessage[];
  currentQuestion?: Question;
  fishingTimeLeft?: number;
  fishes?: any[];
  caughtFishIds?: number[];
  round: number;
  totalRounds: number;
  roundStartTime?: number;
  askedQuestions: string[];
}

export type PeerMessage = 
  | { type: 'STATE_UPDATE', state: GameState }
  | { type: 'JOIN', player: RoomPlayer, password?: string }
  | { type: 'JOIN_REJECTED', reason: string }
  | { type: 'CHAT', message: ChatMessage }
  | { type: 'TOGGLE_READY', playerId: string }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_ANSWER', playerId: string, answer: string, timeToAnswerMs: number }
  | { type: 'KICK', playerId: string }
  | { type: 'KICKED', reason: string }
  | { type: 'MUTE', playerId: string, isMuted: boolean }
  | { type: 'CHANGE_CATEGORY', category: string }
  | { type: 'CHANGE_MODE', gameMode: 'quiz' | 'fishing' }
  | { type: 'FORCE_NEXT_QUESTION' }
  | { type: 'LEAVE', playerId: string }
  | { type: 'TRANSFER_HOST', playerId: string }
  | { type: 'PING', playerId: string }
  | { type: 'FISH_SPAWN', fish: any }
  | { type: 'FISH_CATCH', playerId: string, fishId: number, points: number, fType: string };
