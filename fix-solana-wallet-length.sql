-- ============================================
-- FIX: Extend wallet_address column for Solana addresses
-- ============================================
-- Solana addresses are 44 characters (base58 encoded)
-- Ethereum addresses are 42 characters (0x + 40 hex chars)
-- The current schema only supports 42 chars, causing errors

-- Extend wallet_address to support Solana addresses (44 chars) and future formats
ALTER TABLE player_wallets
ALTER COLUMN wallet_address TYPE VARCHAR(100);

-- Also update tx_hash to support Solana transaction signatures (88 chars)
ALTER TABLE minted_waifus
ALTER COLUMN tx_hash TYPE VARCHAR(100);

-- Update signature column to support longer signatures
ALTER TABLE pending_mints
ALTER COLUMN signature TYPE VARCHAR(200);

-- Add index if it doesn't exist (for faster lookups)
CREATE INDEX IF NOT EXISTS idx_wallets_address ON player_wallets(wallet_address);

-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================
