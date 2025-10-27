-- Add example waifus to get you started
-- Run this in Supabase SQL Editor

-- Waifu 5: Misty (Water type)
INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, captured_img, rarity, emoji,
  max_supply, current_supply, spawn_start, spawn_end, price, contract_token_id
) VALUES (
  'w5', 'Misty', -34.6037, -58.3816, 50000,
  '/waifus/waifu01/waifus_01.png',
  '/waifus/waifu01/waifus_01_captured.png',
  'rare', '💧', 50, 0,
  NOW(), NOW() + INTERVAL '7 days', '0.002', 5
) ON CONFLICT (id) DO NOTHING;

-- Waifu 6: Blaze (Fire type)
INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, captured_img, rarity, emoji,
  max_supply, current_supply, spawn_start, spawn_end, price, contract_token_id
) VALUES (
  'w6', 'Blaze', -34.5037, -58.4816, 50000,
   '/waifus/waifu02/waifus_02_captured.png',
  'epic', '🔥', 25, 0,
  NOW(), NOW() + INTERVAL '7 days', '0.005', 6
) ON CONFLICT (id) DO NOTHING;

-- Waifu 7: Aria (Wind type)
INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, captured_img, rarity, emoji,
  max_supply, current_supply, spawn_start, spawn_end, price, contract_token_id
) VALUES (
  'w7', 'Aria', -34.7037, -58.2816, 50000,
  '/waifus/waifu03/waifus_03.png',
  '/waifus/waifu03/waifus_03_captured.png',
  'common', '💨', 100, 0,
  NOW(), NOW() + INTERVAL '7 days', '0.001', 7
) ON CONFLICT (id) DO NOTHING;

-- Waifu 8: Nova (Star type) - Legendary!
INSERT INTO waifu_spawns (
  id, name, lat, lng, radius, img, captured_img, rarity, emoji,
  max_supply, current_supply, spawn_start, spawn_end, price, contract_token_id
) VALUES (
  'w8', 'Nova', -34.8037, -58.3000, 50000,
  '/waifus/waifu04/waifus_04.png',
  '/waifus/waifu04/waifus_04_captured.png',
  'legendary', '⭐', 10, 0,
  NOW(), NOW() + INTERVAL '7 days', '0.01', 8
) ON CONFLICT (id) DO NOTHING;

-- Check what you added
SELECT id, name, rarity, emoji, max_supply, contract_token_id FROM waifu_spawns ORDER BY id;
