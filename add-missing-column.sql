-- Add the captured_img column if it doesn't exist
ALTER TABLE waifu_spawns
ADD COLUMN IF NOT EXISTS captured_img VARCHAR(255) NOT NULL DEFAULT '';

-- Also make sure contract_token_id exists
ALTER TABLE waifu_spawns
ADD COLUMN IF NOT EXISTS contract_token_id INTEGER NOT NULL DEFAULT 0;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
