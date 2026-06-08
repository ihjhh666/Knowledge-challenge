export interface SupabasePlayer {
  id: string; // uuid
  username: string;
  is_online: boolean;
  last_active_at: string;
  created_at: string;
}

export interface SupabaseRoom {
  id: string; // e.g. ROOM-1234
  host_name: string;
  category: string;
  game_mode: string;
  player_count: number;
  max_players: number;
  room_visibility: string;
  status: string;
  created_at: string;
  last_active_at: string;
}

export interface SupabaseLeaderboardEntry {
  id: string; // uuid
  username: string;
  total_points: number;
  games_played: number;
  games_won: number;
  updated_at: string;
}
