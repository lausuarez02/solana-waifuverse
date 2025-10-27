-- Fix missing mints in database
-- Run this in Supabase SQL Editor to add your existing mints

-- INSTRUCTIONS:
-- 1. Replace YOUR_FID with your Farcaster ID (the number from fc_auth_token)
-- 2. Replace YOUR_WALLET_ADDRESS with your connected wallet (0x...)
-- 3. Replace WAIFU_ID with the waifu you minted (w1, w2, w3, or w4)
-- 4. Optionally add TX_HASH from BaseScan if you have it

-- Example for Sakura (w1):
INSERT INTO minted_waifus (fid, waifu_id, token_id, tx_hash, minted_at)
VALUES (
  YOUR_FID,              -- Replace with your FID (e.g., 832780)
  'w1',                  -- Waifu ID: w1, w2, w3, or w4
  NULL,                  -- Token ID (can leave NULL if you don't know)
  'YOUR_TX_HASH',        -- Transaction hash from BaseScan (or NULL)
  NOW()                  -- Current timestamp
)
ON CONFLICT (fid, waifu_id) DO NOTHING;

-- If you minted multiple waifus, add more rows:
-- INSERT INTO minted_waifus (fid, waifu_id, token_id, tx_hash, minted_at)
-- VALUES (YOUR_FID, 'w2', NULL, 'TX_HASH_2', NOW())
-- ON CONFLICT (fid, waifu_id) DO NOTHING;

-- Also make sure the capture exists:
INSERT INTO waifu_captures (fid, waifu_id, captured_at)
VALUES (
  YOUR_FID,
  'w1',
  NOW()
)
ON CONFLICT (fid, waifu_id) DO NOTHING;

-- Make sure your wallet is linked:
INSERT INTO player_wallets (fid, wallet_address, created_at)
VALUES (
  YOUR_FID,
  'YOUR_WALLET_ADDRESS',  -- e.g., '0x1234...'
  NOW()
)
ON CONFLICT (fid) DO UPDATE SET wallet_address = EXCLUDED.wallet_address;

-- QUICK FIX VERSION (if you know your FID):
-- Uncomment and replace values:

-- INSERT INTO minted_waifus (fid, waifu_id, minted_at)
-- VALUES (832780, 'w1', NOW())
-- ON CONFLICT DO NOTHING;

-- INSERT INTO waifu_captures (fid, waifu_id, captured_at)
-- VALUES (832780, 'w1', NOW())
-- ON CONFLICT DO NOTHING;
