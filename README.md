![WaifuVerse](./public/blue-icon.jpeg)

# WaifuVerse
A Pokemon GO-style NFT collection game built as a Farcaster Mini App. Capture waifus in the real world, mint them as NFTs on Base blockchain, and chat with your collection using AI.

## Features
SMART contracts: https://github.com/lausuarez02/solana-smc-waifuverse
- 🗺️ **Real-world Map** - Hunt waifus using your GPS location
- 💖 **NFT Minting** - Mint captured waifus as ERC-721 NFTs on Base
- 💬 **AI Chat** - Talk to your minted waifus powered by Grok AI
- 🎮 **8-bit Retro UI** - Pixel-perfect retro gaming aesthetic
- 🔐 **Signature-based Minting** - Only game-captured waifus can be minted
- 🌐 **Farcaster Integration** - Built as a Farcaster Mini App

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** CSS Modules, 8-bit UI components
- **Blockchain:** Base (L2), ethers.js, wagmi, OnchainKit
- **Auth:** Farcaster Quick Auth (JWT)
- **Database:** Supabase (PostgreSQL)
- **AI:** Grok-2 API
- **Maps:** Leaflet with custom pixel styling
- **Smart Contract:** ERC-721 with signature-based minting

## Smart Contract

### Contract Information

**Contract Address:** `0xEE5F14f1b6D72AC63a01a4C0C84a0041D2273D68`
**Network:** Base Mainnet (Chain ID: 8453)
**Standard:** ERC-721 (WaifuVerse)

**Links:**
- [Smart Contract Repository](https://github.com/lausuarez02/waifu-nft-contracts) - Full contract source code
- [View on BaseScan](https://basescan.org/address/0xEE5F14f1b6D72AC63a01a4C0C84a0041D2273D68)
- [OpenSea Collection](https://opensea.io/collection/waifuverse-6)

### How It Works

The contract uses **signature-based minting** to prevent unauthorized NFT creation:

1. Player captures waifu in-game (verified by backend)
2. Backend generates cryptographic signature for that specific player + waifu
3. Player submits signature to smart contract with ETH payment
4. Contract verifies signature came from game backend
5. NFT is minted to player's wallet

**Key Security Features:**
- Only backend with private key can authorize mints
- Each signature is one-time use (prevents replay attacks)
- Signature includes player address (can't be transferred)
- Chain-specific signatures (prevents cross-chain abuse)

### Minting Flow

```typescript
// Backend generates signature
const signature = generateMintSignature(playerAddress, waifuId);

// Frontend calls contract
await contract.mint(waifuId, signature, { value: price });
```

### Contract Functions

**For Players:**
- `mint(waifuId, signature)` - Mint a waifu NFT with backend-provided signature

**For Admin:**
- `addWaifu()` - Add new waifu type to collection
- `toggleWaifu()` - Enable/disable minting for a waifu
- `updateWaifuPrice()` - Update mint price
- `withdraw()` - Withdraw collected ETH

### On-Chain Metadata

Metadata is stored **directly on-chain** (no IPFS needed):

```json
{
  "name": "Eve #2",
  "description": "A captured waifu from WaifuVerse game.",
  "image": "https://supabase.co/.../waifu_01.jpeg",
  "attributes": [
    { "trait_type": "Waifu", "value": "Eve" },
    { "trait_type": "Serial Number", "value": 2 },
    { "trait_type": "Mint Value", "value": "0.000001 ETH" }
  ]
}
```

## Game Features

### Map View
- Real-time GPS tracking with custom pixel-styled map
- Heart markers show waifu locations
- Distance and direction indicators
- Capture range detection (50m radius)

### NFT System
- Signature-based minting (prevents bot abuse)
- On-chain metadata (no IPFS needed)
- Rarity tiers: Common, Rare, Epic, Legendary
- Supply caps per waifu
- Automatic OpenSea integration

### AI Chat
- Talk to minted waifus using Grok-2 AI
- Unique personality per waifu
- Streaming responses for real-time chat
- 8-bit styled chat interface

## Project Structure

```
waifuverse/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Farcaster authentication
│   │   ├── chat/         # AI chat endpoint
│   │   ├── capture/      # Waifu capture logic
│   │   ├── mint-signature/ # Signature generation
│   │   └── spawns/       # Waifu spawn management
│   ├── game/             # Game pages
│   │   └── charm/
│   │       ├── map/      # Map view
│   │       ├── hunt/     # Hunt mode
│   │       ├── collection/ # NFT collection
│   │       └── chat/     # AI chat
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/8bit/          # 8-bit UI components
│   ├── PixelMap.tsx      # Custom Leaflet map
│   └── WaifuCard.tsx     # NFT card component
├── contract/             # Smart contract (Hardhat)
├── lib/
│   ├── contract-abi.ts   # Contract ABI & address
│   ├── store.ts          # Local storage utils
│   └── geo.ts            # GPS utilities
└── public/
    ├── waifus/           # Waifu sprite images
    └── videos/           # Intro video

```

## Learn More

- [Smart Contract Repository](https://github.com/lausuarez02/waifu-nft-contracts) - Full contract source code and documentation
- [Base Mini Apps Tutorial](https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/)
- [Farcaster SDK Docs](https://docs.farcaster.xyz/)
- [OnchainKit Docs](https://onchainkit.xyz/)

## License

MIT
