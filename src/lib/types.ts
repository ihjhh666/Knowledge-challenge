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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  roomId: string;
  status: RoomStatus;
  players: Record<string, RoomPlayer>;
  messages: ChatMessage[];
  currentQuestion?: Question;
  round: number;
  totalRounds: number;
  roundStartTime?: number;
}

export type PeerMessage = 
  | { type: 'STATE_UPDATE', state: GameState }
  | { type: 'JOIN', player: RoomPlayer }
  | { type: 'CHAT', message: ChatMessage }
  | { type: 'TOGGLE_READY', playerId: string }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_ANSWER', playerId: string, answer: string, timeToAnswerMs: number };
