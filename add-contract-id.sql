-- Add contract_token_id to waifu_spawns table
-- This is the ID that the smart contract uses to identify waifus

ALTER TABLE waifu_spawns
ADD COLUMN IF NOT EXISTS contract_token_id INTEGER NOT NULL DEFAULT 0;

-- Update existing waifus with contract IDs
-- Assuming w1 = tokenId 1, w2 = tokenId 2, etc.
UPDATE waifu_spawns SET contract_token_id = 1 WHERE id = 'w1';
UPDATE waifu_spawns SET contract_token_id = 2 WHERE id = 'w2';
UPDATE waifu_spawns SET contract_token_id = 3 WHERE id = 'w3';
UPDATE waifu_spawns SET contract_token_id = 4 WHERE id = 'w4';

-- You can also set them differently if your contract uses different IDs
