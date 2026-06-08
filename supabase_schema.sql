-- Phase 1 Schema: Run this in your Supabase SQL Editor

-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rooms Table
-- Note: id is TEXT to maintain compatibility with existing 'ROOM-XXXX' formats.
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  host_name TEXT NOT NULL,
  category TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  player_count INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 10,
  room_visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_players_online_last_active ON players(is_online, last_active_at);
CREATE INDEX IF NOT EXISTS idx_rooms_visibility_status ON rooms(room_visibility, status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_points ON leaderboard(total_points DESC);

-- 5. Enable Row Level Security (RLS) but allow anonymous access for testing Phase 1
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for testing on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for testing on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for testing on leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
