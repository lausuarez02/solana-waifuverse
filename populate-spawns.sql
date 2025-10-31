-- ============================================
-- Populate waifu_spawns table with initial data
-- ============================================

-- Delete existing spawns (optional - only if you want a fresh start)
-- DELETE FROM waifu_spawns;

-- Insert the 4 initial waifus
-- Note: Only w1 exists in the actual contract right now!

INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, capturedimg, rarity, emoji,
  max_supply, current_supply, spawn_start, spawn_end, price, contract_token_id
) VALUES
(
  'w1',
  'Sakura (Sol)',
  -34.6037,
  -58.3816,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'common',
  '🌸',
  1000,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '100000000',  -- 0.1 SOL in lamports
  1  -- Contract token ID (this one exists in the contract!)
),
(
  'w2',
  'Luna',
  -40.158595,
  -71.352592,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'rare',
  '🌙',
  50,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '150000000',  -- 0.15 SOL in lamports
  2  -- Need to add to contract!
),
(
  'w3',
  'Yuki',
  -34.6037,
  -58.3816,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'epic',
  '❄️',
  25,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '200000000',  -- 0.2 SOL in lamports
  3  -- Need to add to contract!
),
(
  'w4',
  'Hana',
  -34.842535,
  -58.282251,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'common',
  '🌺',
  100,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '100000000',  -- 0.1 SOL in lamports
  4  -- Need to add to contract!
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  radius = EXCLUDED.radius,
  img = EXCLUDED.img,
  captured_img = EXCLUDED.captured_img,
  rarity = EXCLUDED.rarity,
  emoji = EXCLUDED.emoji,
  max_supply = EXCLUDED.max_supply,
  spawn_start = EXCLUDED.spawn_start,
  spawn_end = EXCLUDED.spawn_end,
  price = EXCLUDED.price,
  contract_token_id = EXCLUDED.contract_token_id;

-- Verify the spawns were added
SELECT id, name, contract_token_id, price, max_supply, current_supply
FROM waifu_spawns
ORDER BY id;

-- ============================================
-- Run this in your Supabase SQL Editor NOW!
-- ============================================
