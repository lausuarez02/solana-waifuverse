# 🚀 Supabase Setup - Quick Start

## What You Need:

1. **Supabase Account** (free tier is fine)
2. **Private Key** for signing mints
3. **Contract Address**: `0x6C3f845783336f3514255EEaBE0bAf291463FeC2` ✅ (already set)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "waifuverse")
4. Set a database password
5. Select a region close to your users
6. Wait ~2 minutes for setup

---

## Step 2: Run SQL Setup

1. In Supabase dashboard → Click "SQL Editor"
2. Click "New Query"
3. Copy/paste the entire contents of `supabase-setup.sql` file
4. Click "Run" or press Cmd/Ctrl + Enter
5. You should see "Success. No rows returned"

This creates all 5 tables + indexes + functions!

---

## Step 3: Get Your Credentials

### Get Supabase URL:
1. Go to Settings → API
2. Copy "Project URL"
   - Example: `https://abcdefgh.supabase.co`

### Get Service Role Key:
1. Same page (Settings → API)
2. Scroll to "Project API keys"
3. Copy "service_role" key (the long one, ~200+ characters)
4. ⚠️ **NEVER** share this or commit to git!

---

## Step 4: Generate Signer Private Key

Run this command:

```bash
node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Private Key:', w.privateKey, '\nAddress:', w.address);"
```

**Save both:**
- Private Key → goes in `.env.local`
- Address → you need to add this to your smart contract as the authorized signer

---

## Step 5: Add to .env.local

Create/update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-very-long-key

# Minting
GAME_SIGNER_PRIVATE_KEY=0x...your-private-key
CONTRACT_ADDRESS=0x6C3f845783336f3514255EEaBE0bAf291463FeC2
```

---

## Step 6: Update Smart Contract

Your contract needs to accept signatures from your signer address.

Add this to your contract or update the signer address:

```solidity
address public gameSigner = 0xYOUR_SIGNER_ADDRESS; // From Step 4
```

---

## Step 7: Test It!

1. Restart your dev server: `pnpm dev`
2. Sign in with Farcaster
3. Capture a waifu in AR mode
4. Go to Collection page
5. Click "⚡ MINT NFT"

You should see:
- ✅ Signature generated
- ✅ Supply info shown
- ✅ No errors in console

---

## Verify Tables Were Created

In Supabase dashboard → Table Editor, you should see:

- ✅ `player_wallets`
- ✅ `waifu_captures`
- ✅ `minted_waifus`
- ✅ `pending_mints`
- ✅ `waifu_spawns`

---

## Initialize Spawn Data

The first time you call `/api/spawns`, it will auto-populate the `waifu_spawns` table with:

- **Sakura** - Common (100 max supply)
- **Luna** - Rare (50 max supply)
- **Yuki** - Epic (25 max supply)
- **Hana** - Common (100 max supply)

All set to expire in 7 days.

---

## Troubleshooting

### "Failed to fetch spawns"
- Check Supabase URL is correct
- Check service role key is correct
- Verify tables were created (check Table Editor)

### "Invalid signature"
- Make sure contract has correct signer address
- Check GAME_SIGNER_PRIVATE_KEY is set
- Verify private key format starts with `0x`

### "You have not captured this waifu"
- Capture system requires auth (sign in first)
- Check browser console for capture API errors
- Verify `waifu_captures` table exists

---

## What's Next?

Once this is working, you need to:

1. **Connect real wallet** (wagmi) instead of placeholder
2. **Call blockchain contract** with the signature from mint API
3. **Save mint result** back to database after successful blockchain tx
4. **Increment spawn supply** after mint

See `MINTING_SETUP.md` for full details!

---

## Security Notes

✅ Service role key is server-side only (never sent to frontend)
✅ RLS policies prevent unauthorized access
✅ Signature verification prevents fake mints
✅ All mints require:
  - Valid JWT (authenticated user)
  - Wallet ownership proof
  - Capture proof
  - Supply available
  - Time window valid

You're good to go! 🎮🔥
