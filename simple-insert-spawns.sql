-- ============================================
-- SIMPLE INSERT - Just add w1 for testing
-- ============================================

-- First, add the contract_token_id column if missing
ALTER TABLE waifu_spawns
ADD COLUMN IF NOT EXISTS contract_token_id INTEGER;

-- Delete any existing test data
DELETE FROM waifu_spawns WHERE id IN ('w1', 'w2', 'w3', 'w4');

-- Insert w1 only (the one that exists in contract)
INSERT INTO waifu_spawns (
  id,
  name,
  lat,
  lng,
  radius,
  img,
  capturedimg,
  captured_img,
  rarity,
  emoji,
  max_supply,
  current_supply,
  spawn_start,
  spawn_end,
  price,
  contract_token_id
) VALUES (
  'w1',
  'Sakura (Sol)',
  -34.6037,
  -58.3816,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'common',
  '🌸',
  1000,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '100000000',
  1
);

-- Verify it was added
SELECT * FROM waifu_spawns WHERE id = 'w1';
