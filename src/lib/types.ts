export type RoomStatus = 'waiting' | 'playing' | 'revealing' | 'finished';

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken';
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
  createdAt: number;
  lastActiveAt?: number;
  roomVisibility: 'public' | 'private' | 'link' | 'password';
}

export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface RoomPlayer {
  id: string; // The peer JS ID or a random ID if host
  userId?: string;
  username: string;
  avatarUrl?: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  hasAnsweredCurrentRound: boolean;
  lastAnswerSucceeded: boolean;
  lastAnswerTime?: number;
  isMuted?: boolean;
  disconnectedAt?: number;
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
  gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken';
  subMode?: string;
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
  penaltyState?: {
    kickerId: string;
    goalieId: string;
    kickerReady: boolean;
    goalieReady: boolean;
    kickerDir?: 'left' | 'center' | 'right';
    goalieDir?: 'left' | 'center' | 'right';
    history: {
      kickerId: string;
      goalieId: string;
      kickerDir?: 'left' | 'center' | 'right';
      goalieDir?: 'left' | 'center' | 'right';
      isGoal: boolean;
    }[];
    countdown?: number;
  };
  dominoState?: {
    turnId: string;
    player1Id: string;
    player2Id: string;
    boneyard: any[];
    board: any[];
    player1Tiles: any[];
    player2Tiles: any[];
    passCount: number;
    winnerId?: string;
    isBlocked?: boolean;
    pointsMatch?: {
      [id: string]: number;
    };
  };
  hockeyState?: {
    player1Id: string; // Used for 1v1
    player2Id: string;
    team1?: string[]; // Used for 2v2
    team2?: string[];
    is2v2?: boolean;
    pointsMatch?: {
      [id: string]: number;
    };
  };
  round: number;
  totalRounds: number;
  roundStartTime?: number;
  askedQuestions: string[];
  rematchApprovals?: string[];
}

export type PeerMessage = 
  | { type: 'STATE_UPDATE', state: GameState }
  | { type: 'JOIN', player: RoomPlayer, password?: string }
  | { type: 'JOIN_REJECTED', reason: string }
  | { type: 'CHAT', message: ChatMessage }
  | { type: 'TOGGLE_READY', playerId: string }
  | { type: 'START_GAME' }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'REQUEST_REMATCH', playerId: string }
  | { type: 'SUBMIT_ANSWER', playerId: string, answer: string, timeToAnswerMs: number }
  | { type: 'KICK', playerId: string }
  | { type: 'KICKED', reason: string }
  | { type: 'MUTE', playerId: string, isMuted: boolean }
  | { type: 'CHANGE_CATEGORY', category: string }
  | { type: 'CHANGE_MODE', gameMode: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken' }
  | { type: 'FORCE_NEXT_QUESTION' }
  | { type: 'LEAVE', playerId: string }
  | { type: 'TRANSFER_HOST', playerId: string }
  | { type: 'PING', playerId: string }
  | { type: 'PING_HOST' }
  | { type: 'FISH_SPAWN', fish: any }
  | { type: 'FISH_CATCH', playerId: string, fishId: number, points: number, fType: string }
  | { type: 'PENALTY_ACTION', playerId: string, action: 'kicker' | 'goalie', dir: 'left' | 'center' | 'right' }
  | { type: 'DOMINO_ACTION', playerId: string, actionDetails: any }
  | { type: 'HOCKEY_ACTION', playerId: string, paddle: { x: number, y: number, vx: number, vy: number } }
  | { type: 'HOCKEY_SYNC', state: { puck: { x: number, y: number, vx: number, vy: number }, paddle1?: { x: number, y: number }, paddle2?: { x: number, y: number }, paddles?: {x: number, y: number}[], goalScorer?: 'player1'|'player2'|null, gameState: 'playing'|'goal'|'results', score1: number, score2: number, winner?: 'player1' | 'player2' | null } }
  | { type: 'HOCKEY_RESTART' }
  | { type: 'CHANGE_HOCKEY_MODE', is2v2: boolean }
  | { type: 'ASSIGN_TEAM', pId: string, team: 1 | 2 }
  | { type: 'ADD_BOT', team: 1 | 2 }
  | { type: 'REMOVE_BOT', botId: string }
  | { type: 'KING_INPUT', playerId?: string, dx: number, dy: number, isSprinting: boolean }
  | { type: 'KING_SYNC', entities: any[], crown: any, activeEvent: any, gameState: string, winner: any }
  | { type: 'CHICKEN_INPUT', playerId: string, dx: number, dy: number }
  | { type: 'CHICKEN_SYNC', players: any[], chickens: any[], events: any, gameState: string, timeOut: number };

