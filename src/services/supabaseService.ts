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

  async cleanupStaleRooms() {
    try {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { error: err1 } = await supabase.from('rooms').delete().lt('last_active_at', tenMinsAgo);
      if (err1) console.error('[Supabase] Failed to cleanup old rooms:', err1);

      const { error: err2 } = await supabase.from('rooms').delete().lte('player_count', 0);
      if (err2) console.error('[Supabase] Failed to cleanup empty rooms:', err2);
    } catch (e) {
      console.error('[Supabase] Error during room cleanup:', e);
    }
  },

  subscribeToRooms(callback: (rooms: SupabaseRoom[]) => void) {
    const channelId = `rooms_${Math.random().toString(36).substring(7)}`;
    console.log(`[Supabase] Subscribing to rooms... Channel: ${channelId}`);
    
    const fetchRooms = () => {
      supabase.from('rooms').select('*')
        .neq('room_visibility', 'private')
        .eq('status', 'waiting')
        .gt('player_count', 0)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('[Supabase] Initial rooms fetch error:', error);
          if (data) {
            console.log(`[Supabase] Rooms fetched: ${data.length} rooms`);
            callback(data);
          }
        });
    };

    // Initial fetch
    fetchRooms();

    // Realtime subscription
    const subscription = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        console.log('[Supabase] Room realtime event received:', payload.eventType, payload.new);
        fetchRooms();
      })
      .subscribe((status) => {
        console.log(`[Supabase] Room channel status: ${status}`);
      });

    return () => { 
      console.log(`[Supabase] Unsubscribing from rooms... Channel: ${channelId}`);
      supabase.removeChannel(subscription); 
    };
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
    const channelId = `leaderboard_${Math.random().toString(36).substring(7)}`;
    console.log(`[Supabase] Subscribing to leaderboard... Channel: ${channelId}`);
    
    supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).limit(50).then(({ data, error }) => {
      if (error) console.error('[Supabase] Initial leaderboard fetch error:', error);
      if (data) callback(data);
    });

    const subscription = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, (payload) => {
        console.log('[Supabase] Leaderboard realtime event:', payload.eventType);
        supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).limit(50).then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe((status) => {
         console.log(`[Supabase] Leaderboard channel status: ${status}`);
      });

    return () => { 
      console.log(`[Supabase] Unsubscribing from leaderboard... Channel: ${channelId}`);
      supabase.removeChannel(subscription); 
    };
  },

  // Players / Presence
  async setPlayerOnline(playerId: string, username: string) {
    if (!playerId) return;
    console.log(`[Supabase_Presence] ONLINE_HEARTBEAT_SENT for: ${username} (${playerId})`);
    
    try {
      const payload = { 
        id: playerId,
        username,
        is_online: true,
        last_active_at: new Date().toISOString()
      };
      const { error } = await supabase.from('players').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error('[Supabase_Presence] Upsert error:', error);
      } else {
        console.log(`[Supabase_Presence] ONLINE_PLAYER_UPSERT_SUCCESS`, payload);
      }
      console.log(`[Supabase_Presence] PLAYER_STATUS_UPDATED to online`);
    } catch (err) {
      console.error('[Supabase_Presence] Heartbeat failed:', err);
    }
  },

  async setPlayerOffline(playerId: string) {
    if (!playerId) return;
    try {
      await supabase.from('players').update({ is_online: false }).eq('id', playerId);
      console.log(`[Supabase_Presence] PLAYER_STATUS_UPDATED to offline`);
    } catch (err) {
      console.error('[Supabase_Presence] Offline mark failed:', err);
    }
  },

  async getOnlinePlayersCount(): Promise<number> {
    try {
      const ninetySecondsAgo = new Date(Date.now() - 90 * 1000).toISOString();
      const { data, count, error } = await supabase.from('players')
        .select('*', { count: 'exact' })
        .eq('is_online', true)
        .gte('last_active_at', ninetySecondsAgo);

      if (error) {
        console.error('[Supabase] getOnlinePlayersCount error:', error);
        return 0;
      }
      
      console.log(`[Supabase_Presence] ONLINE_PLAYERS_RAW:`, data);
      console.log(`[Supabase_Presence] ONLINE_COUNT_FETCHED: ${count || 0}`);
      return count || 0;
    } catch (e) {
      console.error('[Supabase] getOnlinePlayersCount exception:', e);
      return 0;
    }
  },

  subscribeToOnlineCount(callback: (count: number) => void) {
    const updateCount = async () => {
       const count = await this.getOnlinePlayersCount();
       callback(count);
    };
    
    updateCount();
    
    // Poll every 15 seconds instead of massive real-time row events across all users
    const interval = setInterval(updateCount, 15000); 

    return () => { 
      clearInterval(interval);
    };
  }
};
