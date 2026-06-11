import { 
  createPublicRoom, updatePublicRoom, deletePublicRoom, subscribeToPublicRooms,
  updatePlayerStats, subscribeToLeaderboard, updateOnlinePresence, removeOnlinePresence,
  subscribeToOnlineCount
} from '../lib/firebase';

export const supabaseService = {
  // Mock debugging stats
  async getTableStats() {
    return { players: 0, rooms: 0, leaderboard: 0, hasSchemaError: false, errors: {}, isConnected: true };
  },

  // Rooms
  async createPublicRoom(room: any) {
    if (room.status === 'public') room.roomVisibility = 'public';
    return createPublicRoom(room);
  },

  async updatePublicRoom(roomId: string, updates: any) {
    return updatePublicRoom(roomId, updates);
  },

  async deletePublicRoom(roomId: string) {
    return deletePublicRoom(roomId);
  },

  async cleanupStaleRooms() {
    // Handled by Firebase cloud functions or other scheduled tasks implicitly, or just ignored
  },

  subscribeToRooms(callback: (rooms: any[]) => void) {
    return subscribeToPublicRooms(callback);
  },

  // Leaderboard / Stats
  async updatePlayerStats(
    playerId: string,
    playerName: string,
    isWin: boolean,
    correctAnswers: number,
    wrongAnswers: number,
    points: number,
    category: string
  ) {
    return updatePlayerStats(playerId, playerName, isWin, correctAnswers, wrongAnswers, points, category);
  },

  subscribeToLeaderboard(callback: (entries: any[]) => void) {
    return subscribeToLeaderboard('totalPoints', callback);
  },

  // Players / Presence
  async setPlayerOnline(playerId: string, username: string) {
    return updateOnlinePresence(playerId);
  },

  async setPlayerOffline(playerId: string) {
    return removeOnlinePresence(playerId);
  },

  subscribeToOnlineCount(callback: (count: number) => void) {
    return subscribeToOnlineCount(callback);
  }
};
