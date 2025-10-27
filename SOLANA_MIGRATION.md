# WaifuVerse - Base to Solana Migration Guide

## Overview
Your app has been successfully migrated from **Base (EVM)** to **Solana**! This document explains what changed and the next steps.

---

## What Changed

### 1. Blockchain Infrastructure
- **Before**: Base chain (EVM) with ethers.js/wagmi/viem
- **After**: Solana with @solana/web3.js and wallet-adapter

### 2. Wallet Connection
- **Before**: OnchainKit with Coinbase Wallet integration
- **After**: Solana Wallet Adapter + Reown (WalletConnect)
  - Supports: Phantom, Solflare, Backpack, Torus, and more via WalletConnect

### 3. Smart Contract → Program
- **Before**: EVM smart contract at `0xEE5F14f1b6D72AC63a01a4C0C84a0041D2273D68`
- **After**: Solana Program (needs deployment)

### 4. NFT Standard
- **Before**: ERC-721 NFTs on Base
- **After**: Metaplex Token Metadata Standard on Solana

### 5. Transaction Flow
- **Before**: `writeContract()` → wait for confirmation → parse events
- **After**: Build `Transaction` → `sendTransaction()` → confirm on Solana

---

## Updated Files

### Core Configuration
- ✅ `app/rootProvider.tsx` - Now uses Solana WalletProvider + Reown AppKit
- ✅ `lib/contract-abi.ts` - Renamed to Solana program config with helper functions
- ✅ `.env.example` - Updated with Solana environment variables

### Components
- ✅ `components/WalletStatus.tsx` - Shows Solana wallet + connection button
- ✅ `app/game/charm/collection/page.tsx` - Minting with Solana transactions

### API Routes
- ✅ `app/api/mint-signature/route.ts` - Generates Solana transaction signatures
- ✅ `app/api/wallet/route.ts` - Stores Solana public keys (base58 format)

### Removed
- ❌ Base-specific hooks (`useBaseAccountCapabilities`, `useSponsoredTransactions`)
- ❌ Sponsored mint button (Base paymaster feature)
- ❌ EVM dependencies (wagmi, viem, ethers, OnchainKit)

---

## Next Steps

### Step 1: Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # Start with devnet for testing
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_PROGRAM_ID=<your-program-id>
NEXT_PUBLIC_COLLECTION_AUTHORITY=<your-authority-pubkey>
GAME_SIGNER_PRIVATE_KEY=<base58-encoded-keypair>

# Optional: Reown (WalletConnect) for more wallet options
NEXT_PUBLIC_REOWN_PROJECT_ID=<get-from-https://cloud.reown.com/>
```

### Step 2: Generate a Solana Keypair for Authority

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate authority keypair
solana-keygen new --no-passphrase -o authority.json

# Get public key
solana-keygen pubkey authority.json

# Convert to base58 for GAME_SIGNER_PRIVATE_KEY
node -e "const fs = require('fs'); const bs58 = require('bs58'); const keypair = JSON.parse(fs.readFileSync('authority.json')); console.log(bs58.encode(Buffer.from(keypair)));"
```

### Step 3: Deploy Your Solana Program

You need to create and deploy a Solana NFT minting program. Here are your options:

#### Option A: Use Metaplex Candy Machine (Easiest)
Metaplex provides ready-made NFT minting programs:
- [Candy Machine v3 Docs](https://docs.metaplex.com/programs/candy-machine/)
- Handles minting, pricing, supply limits automatically
- No custom program code needed

```bash
npm install -g @metaplex-foundation/js
# Follow Metaplex docs to deploy a Candy Machine
```

#### Option B: Custom Solana Program (Advanced)
Write a custom program in Rust using Anchor framework:
- [Anchor Framework](https://www.anchor-lang.com/)
- Full control over minting logic
- Can integrate your signature verification

Example program structure:
```rust
// Instructions:
// 1. initialize_collection() - Set up collection metadata
// 2. mint_nft() - Mint NFT with signature verification
// 3. verify_signature() - Validate server signature
```

#### Option C: Use Solana Token Extensions (Intermediate)
Use Solana's built-in token extensions:
- [Token-2022 Program](https://spl.solana.com/token-2022)
- Create NFTs with metadata extension
- Simpler than custom program

### Step 4: Update Frontend Minting Logic

Once you have a program, update `app/game/charm/collection/page.tsx`:

Replace the placeholder transaction code (line 231-237) with your actual program instruction:

```typescript
// Example with Metaplex Candy Machine
import { createMintNftInstruction } from "@metaplex-foundation/mpl-candy-machine";

const mintInstruction = createMintNftInstruction({
  candyMachine: CANDY_MACHINE_ADDRESS,
  payer: publicKey,
  // ... other accounts
});

transaction.add(mintInstruction);
```

Or with a custom program:
```typescript
import { TransactionInstruction } from "@solana/web3.js";

const mintIx = new TransactionInstruction({
  programId: WAIFU_PROGRAM_ID,
  keys: [
    { pubkey: publicKey, isSigner: true, isWritable: true },
    { pubkey: mintAccount, isSigner: false, isWritable: true },
    // ... other accounts
  ],
  data: Buffer.from([
    1, // Instruction discriminator for "mint"
    ...waifuIdBytes,
    ...signatureBytes,
  ])
});

transaction.add(mintIx);
```

### Step 5: Get a Reown Project ID (Optional but Recommended)

For better wallet compatibility:
1. Go to [https://cloud.reown.com/](https://cloud.reown.com/)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Add to `.env.local`: `NEXT_PUBLIC_REOWN_PROJECT_ID=...`

This enables WalletConnect support for mobile wallets and browser extensions.

### Step 6: Test on Devnet

```bash
# Use devnet for testing
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Get devnet SOL from faucet
solana airdrop 2 <your-wallet-address> --url devnet

# Test minting
npm run dev
```

### Step 7: Deploy to Mainnet

Once tested on devnet:
1. Switch to mainnet in `.env.local`
2. Use a reliable RPC provider (Helius, QuickNode, Alchemy)
3. Fund your authority wallet with SOL
4. Deploy program to mainnet
5. Update `NEXT_PUBLIC_SOLANA_PROGRAM_ID`

---

## Database Changes Needed

Your database should already store wallet addresses as strings, so Solana addresses (base58) will work fine.

**No schema changes required!** Solana addresses are just different strings than Ethereum addresses.

Before: `0x1234...abcd` (42 chars, hex)
After: `AbCd...XyZ9` (32-44 chars, base58)

---

## Key Differences: EVM vs Solana

| Feature | Base (EVM) | Solana |
|---------|-----------|--------|
| Address Format | Hex (0x...) | Base58 |
| Transaction Fees | Gas in ETH/GWEI | Lamports (1 SOL = 10^9 lamports) |
| NFT Standard | ERC-721 | Metaplex Token Metadata |
| Account Model | Account-based | Account-based (but different) |
| Transaction Speed | ~2 seconds | ~400ms |
| Average Fee | $0.01-$1 | $0.0001-$0.001 |
| Smart Contracts | Solidity | Rust/C/C++ |

---

## Wallet Support

Your app now supports these Solana wallets:

**Built-in:**
- Phantom (most popular)
- Solflare
- Backpack
- Torus

**Via Reown (WalletConnect):**
- Any wallet supporting WalletConnect
- Mobile wallets
- Hardware wallets (Ledger, etc.)

---

## Troubleshooting

### "Transaction simulation failed"
- Check your program is deployed correctly
- Verify all account addresses in instruction
- Ensure wallet has enough SOL for fees

### "Blockhash not found"
- Transaction took too long
- Use recent blockhash: `transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash`

### "Wallet adapter not found"
- User doesn't have the wallet installed
- Tell them to install Phantom or use WalletConnect

### RPC rate limiting
- Free RPCs are rate limited
- Use paid RPC provider (Helius, QuickNode, Alchemy)

---

## Resources

### Solana Development
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)

### NFT Standards
- [Metaplex Docs](https://docs.metaplex.com/)
- [Token Metadata Standard](https://docs.metaplex.com/programs/token-metadata/)

### Wallet Integration
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)
- [Reown (WalletConnect)](https://docs.reown.com/)

### RPC Providers
- [Helius](https://www.helius.dev/) - Recommended, free tier available
- [QuickNode](https://www.quicknode.com/)
- [Alchemy](https://www.alchemy.com/)
- [Triton](https://triton.one/)

---

## Questions?

The migration is complete on the frontend/API side. The main remaining work is:

1. **Deploy Solana program** (or use Metaplex Candy Machine)
2. **Set environment variables**
3. **Test on devnet**
4. **Deploy to mainnet**

Good luck with your Solana NFT project! 🚀
