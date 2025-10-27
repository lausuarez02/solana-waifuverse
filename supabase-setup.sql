-- ============================================
-- WAIFUVERSE SUPABASE DATABASE SETUP
-- ============================================

-- Run this in your Supabase SQL Editor

-- 1. Create Tables
-- ============================================

-- Player Wallets
CREATE TABLE IF NOT EXISTS player_wallets (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid)
);

-- Waifu Captures
CREATE TABLE IF NOT EXISTS waifu_captures (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  waifu_id VARCHAR(50) NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, waifu_id)
);

-- Minted Waifus
CREATE TABLE IF NOT EXISTS minted_waifus (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  waifu_id VARCHAR(50) NOT NULL,
  token_id BIGINT,
  tx_hash VARCHAR(66),
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, waifu_id)
);

-- Pending Mints
CREATE TABLE IF NOT EXISTS pending_mints (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  waifu_id VARCHAR(50) NOT NULL,
  signature VARCHAR(132) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, waifu_id)
);

-- Waifu Spawns
CREATE TABLE IF NOT EXISTS waifu_spawns (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL,
  img VARCHAR(255) NOT NULL,
  captured_img VARCHAR(255) NOT NULL,
  rarity VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  max_supply INTEGER NOT NULL,
  current_supply INTEGER DEFAULT 0,
  spawn_start TIMESTAMP WITH TIME ZONE NOT NULL,
  spawn_end TIMESTAMP WITH TIME ZONE NOT NULL,
  price VARCHAR(50) NOT NULL
);

-- 2. Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_captures_fid ON waifu_captures(fid);
CREATE INDEX IF NOT EXISTS idx_mints_fid ON minted_waifus(fid);
CREATE INDEX IF NOT EXISTS idx_spawns_active ON waifu_spawns(spawn_start, spawn_end, current_supply);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON player_wallets(wallet_address);

-- 3. Create Functions
-- ============================================

-- Function to safely increment spawn supply
CREATE OR REPLACE FUNCTION increment_spawn_supply(spawn_id VARCHAR(50))
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE waifu_spawns
  SET current_supply = current_supply + 1
  WHERE id = spawn_id
  AND current_supply < max_supply;
END;
$$;

-- 4. Enable Row Level Security (Optional but recommended)
-- ============================================

ALTER TABLE player_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE waifu_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE minted_waifus ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE waifu_spawns ENABLE ROW LEVEL SECURITY;

-- Policies: Allow service role to do everything (for backend)
-- You're using the service role key on the backend, so these policies allow full access

CREATE POLICY "Service role has full access to player_wallets"
  ON player_wallets FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to waifu_captures"
  ON waifu_captures FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to minted_waifus"
  ON minted_waifus FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to pending_mints"
  ON pending_mints FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to waifu_spawns"
  ON waifu_spawns FOR ALL
  USING (auth.role() = 'service_role');

-- Allow public read access to spawns (optional, for frontend to fetch directly)
CREATE POLICY "Anyone can read active spawns"
  ON waifu_spawns FOR SELECT
  USING (true);
