-- ============================================
-- Fix waifu_spawns table structure
-- ============================================

-- Add contract_token_id column if it doesn't exist
ALTER TABLE waifu_spawns
ADD COLUMN IF NOT EXISTS contract_token_id INTEGER;

-- Now insert the spawns
INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, capturedimg, captured_img, rarity, emoji,
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
  '/waifus/waifu00/waifus_00_captured.png',
  'common',
  '🌸',
  1000,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '100000000',
  1
),
(
  'w2',
  'Luna',
  -40.158595,
  -71.352592,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'rare',
  '🌙',
  50,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '150000000',
  2
),
(
  'w3',
  'Yuki',
  -34.6037,
  -58.3816,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'epic',
  '❄️',
  25,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '200000000',
  3
),
(
  'w4',
  'Hana',
  -34.842535,
  -58.282251,
  50000,
  '/waifus/waifu00/waifus_00.png',
  '/waifus/waifu00/waifus_00_captured.png',
  '/waifus/waifu00/waifus_00_captured.png',
  'common',
  '🌺',
  100,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  '100000000',
  4
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  radius = EXCLUDED.radius,
  img = EXCLUDED.img,
  capturedimg = EXCLUDED.capturedimg,
  captured_img = EXCLUDED.captured_img,
  rarity = EXCLUDED.rarity,
  emoji = EXCLUDED.emoji,
  max_supply = EXCLUDED.max_supply,
  spawn_start = EXCLUDED.spawn_start,
  spawn_end = EXCLUDED.spawn_end,
  price = EXCLUDED.price,
  contract_token_id = EXCLUDED.contract_token_id;

-- Verify
SELECT id, name, contract_token_id, price, max_supply
FROM waifu_spawns
ORDER BY id;
