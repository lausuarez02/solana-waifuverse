-- ============================================
-- Add test captures for minting
-- ============================================
-- This manually adds captures for your user so you can test minting
-- Your user ID from the logs: 8086854059818903

-- Add capture for w1 (the only waifu that exists in the contract!)
INSERT INTO waifu_captures (fid, waifu_id, captured_at)
VALUES (8086854059818903, 'w1', NOW())
ON CONFLICT (fid, waifu_id) DO NOTHING;

-- Also add w3 for testing (but it won't mint until added to contract)
INSERT INTO waifu_captures (fid, waifu_id, captured_at)
VALUES (8086854059818903, 'w3', NOW())
ON CONFLICT (fid, waifu_id) DO NOTHING;

-- Verify the captures were added
SELECT * FROM waifu_captures WHERE fid = 8086854059818903;

-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================
