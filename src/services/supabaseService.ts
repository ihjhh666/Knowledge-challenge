import { supabase } from '../lib/supabase';
import { SupabasePlayer, SupabaseRoom, SupabaseLeaderboardEntry } from '../lib/supabaseTypes';

export const supabaseService = {
  // Test functionality for Debug page
  async getTableStats() {
    try {
      const [
        { count: playersCount, error: pErr },
        { count: roomsCount, error: rErr },
        { count: leaderboardCount, error: lErr }
      ] = await Promise.all([
        supabase.from('players').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('leaderboard').select('*', { count: 'exact', head: true })
      ]);

      const hasSchemaError = [pErr, rErr, lErr].some(
        err => err && (err.code === 'PGRST205' || err.message.includes('relation') || err.message.includes('find the table'))
      );

      return {
        players: playersCount ?? 0,
        rooms: roomsCount ?? 0,
        leaderboard: leaderboardCount ?? 0,
        hasSchemaError,
        errors: { pErr, rErr, lErr },
        isConnected: !hasSchemaError && !pErr?.message.includes('fetch')
      };
    } catch (err) {
      console.error("Supabase stats error:", err);
      return { 
        players: 0, rooms: 0, leaderboard: 0, 
        hasSchemaError: false, 
        errors: { catch: err },
        isConnected: false
      };
    }
  },

  // Rooms
  async createPublicRoom(room: {
    roomId: string;
    hostName: string;
    category: string;
    gameMode?: string;
    playerCount: number;
    maxPlayers: number;
    roomVisibility: string;
    status: string;
    createdAt?: number;
  }) {
    const { error } = await supabase.from('rooms').insert({
      id: room.roomId,
      host_name: room.hostName,
      category: room.category,
      game_mode: room.gameMode || 'quiz',
      player_count: room.playerCount,
      max_players: room.maxPlayers,
      room_visibility: room.roomVisibility,
      status: room.status,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    });
    if (error) console.error('Failed to create room:', error);
  },

  async updatePublicRoom(roomId: string, updates: any) {
    const dbUpdates: any = { last_active_at: new Date().toISOString() };
    if (updates.hostName !== undefined) dbUpdates.host_name = updates.hostName;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.gameMode !== undefined) dbUpdates.game_mode = updates.gameMode;
    if (updates.playerCount !== undefined) dbUpdates.player_count = updates.playerCount;
    if (updates.maxPlayers !== undefined) dbUpdates.max_players = updates.maxPlayers;
    if (updates.roomVisibility !== undefined) dbUpdates.room_visibility = updates.roomVisibility;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase.from('rooms').update(dbUpdates).eq('id', roomId);
    if (error) console.error('Failed to update room:', error);
  },

  async deletePublicRoom(roomId: string) {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) console.error('Failed to delete room:', error);
  },


  subscribeToRooms(callback: (rooms: SupabaseRoom[]) => void) {
    // Initial fetch
    supabase.from('rooms').select('*')
      .neq('room_visibility', 'private')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) callback(data);
      });

    // Realtime subscription
    const subscription = supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        supabase.from('rooms').select('*')
          .neq('room_visibility', 'private')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) callback(data);
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  },

  // Leaderboard
  async updatePlayerStats(
    playerId: string, // unused for now but kept for signature
    username: string,
    isWin: boolean,
    correctAnswers: number,
    wrongAnswers: number,
    points: number,
    category: string
  ) {
    await this.updateLeaderboard(username, points, isWin);
  },

  async updateLeaderboard(username: string, points: number, isWin: boolean) {
    // Find if user exists
    const { data } = await supabase.from('leaderboard').select('*').eq('username', username).single();
    
    if (data) {
      const { error } = await supabase.from('leaderboard').update({
        total_points: (data.total_points || 0) + points,
        games_played: (data.games_played || 0) + 1,
        games_won: (data.games_won || 0) + (isWin ? 1 : 0),
        updated_at: new Date().toISOString()
      }).eq('id', data.id);
      if (error) console.error('Failed to update leaderboard:', error);
    } else {
      const { error } = await supabase.from('leaderboard').insert({
        username,
        total_points: points,
        games_played: 1,
        games_won: isWin ? 1 : 0,
        updated_at: new Date().toISOString()
      });
      if (error) console.error('Failed to create leaderboard entry:', error);
    }
  },

  subscribeToLeaderboard(callback: (entries: import('../lib/supabaseTypes').SupabaseLeaderboardEntry[]) => void) {
    supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).limit(50).then(({ data }) => {
      if (data) callback(data);
    });

    const subscription = supabase.channel('public:leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).limit(50).then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  },

  // Players / Presence
  async setPlayerOnline(username: string) {
    const { data } = await supabase.from('players').select('*').eq('username', username).single();
    if (data) {
      await supabase.from('players').update({ is_online: true, last_active_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await supabase.from('players').insert({ username, is_online: true });
    }
  },

  async setPlayerOffline(username: string) {
    await supabase.from('players').update({ is_online: false }).eq('username', username);
  },

  subscribeToOnlineCount(callback: (count: number) => void) {
    const updateCount = () => {
       const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
       supabase.from('players').select('*', { count: 'exact', head: true })
         .eq('is_online', true)
         .gte('last_active_at', fiveMinsAgo)
         .then(({ count }) => {
           if (count !== null) callback(count);
         });
    };
    
    updateCount();
    
    const subscription = supabase.channel('public:players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, updateCount)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }
};
