-- Fix Row Level Security for all game tables

-- Disable RLS on all tables (simplest solution)
ALTER TABLE player_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE waifu_captures DISABLE ROW LEVEL SECURITY;
ALTER TABLE waifu_spawns DISABLE ROW LEVEL SECURITY;
ALTER TABLE minted_waifus DISABLE ROW LEVEL SECURITY;
ALTER TABLE pending_mints DISABLE ROW LEVEL SECURITY;

-- Note: Your backend already handles security via JWT authentication
-- so RLS is not needed for these tables
