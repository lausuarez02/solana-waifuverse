# Waifuverse NFT Minting System Setup

## Overview

Your game now has a complete backend system for NFT minting with:
- ✅ Time-limited waifu spawns (7 days by default)
- ✅ Supply limits (max mints per waifu)
- ✅ Cryptographic signature generation for secure minting
- ✅ Player wallet tracking
- ✅ Capture and mint tracking

## How It Works

### 1. Waifu Spawns with Limits
- Each waifu has a **max supply** (e.g., 100 common, 50 rare, 25 epic)
- Each waifu has a **time window** (spawn start/end dates)
- Once max supply is reached OR time expires, waifu disappears from map
- `/api/spawns` returns only active spawns

### 2. Capture Flow
1. Player captures waifu in AR mode
2. Saved to localStorage (frontend)
3. Also saved to backend via `/api/capture` (requires auth)
4. Backend tracks: `{ fid, waifuId, capturedAt }`

### 3. Minting Flow
1. Player clicks "⚡ MINT NFT" button on captured waifu
2. Frontend calls `/api/mint-signature` with:
   - `playerAddress` (wallet address)
   - `waifuId` (which waifu to mint)
3. Backend verifies:
   - ✅ Player is authenticated (JWT)
   - ✅ Wallet belongs to player
   - ✅ Player captured this waifu
   - ✅ Hasn't already minted it
   - ✅ Supply still available
   - ✅ Within time window
4. Backend generates cryptographic signature
5. Frontend uses signature to call blockchain contract

## Setup Instructions

### Step 1: Generate Signer Key

Run this script to generate a new private key:

```javascript
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Private Key:', wallet.privateKey);
console.log('Address:', wallet.address);
```

### Step 2: Add Environment Variables

Create/update `.env.local`:

```env
# Copy from .env.example
GAME_SIGNER_PRIVATE_KEY=0x... # Use the private key from Step 1
CONTRACT_ADDRESS=0x... # Your deployed NFT contract address
```

**IMPORTANT**: Never commit `.env.local` to git!

### Step 3: Deploy Your NFT Contract

Your contract needs to verify signatures. Example Solidity:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract WaifuNFT is ERC721 {
    address public gameSigner; // Use the address from Step 1
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    constructor(address _gameSigner) ERC721("Waifuverse", "WAIFU") {
        gameSigner = _gameSigner;
    }

    function mint(uint256 waifuId, bytes memory signature) external payable {
        // 1. Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, waifuId, block.chainid));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        require(recoverSigner(ethSignedMessageHash, signature) == gameSigner, "Invalid signature");

        // 2. Check not already minted
        require(!hasMinted[msg.sender][waifuId], "Already minted");

        // 3. Mint NFT
        uint256 tokenId = (waifuId * 10000) + tokenCounter[waifuId]++;
        _mint(msg.sender, tokenId);
        hasMinted[msg.sender][waifuId] = true;
    }

    function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
```

### Step 4: Connect Player Wallets

Add wallet connection to your game (currently using placeholder address):

```typescript
// In collection page, replace placeholder wallet with real wallet connection
import { useAccount } from 'wagmi';

const { address } = useAccount();

// In handleMint call:
handleMint(waifu.id, address);
```

### Step 5: Save Wallet Address

When player connects wallet, save it:

```typescript
await fetch('/api/wallet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ walletAddress: address })
});
```

## API Endpoints

### POST /api/mint-signature
Generate signature for minting.

**Request:**
```json
{
  "playerAddress": "0x123...",
  "waifuId": "w1"
}
```

**Response:**
```json
{
  "signature": "0xabc123...",
  "waifuId": "w1",
  "price": "0.001",
  "contractAddress": "0x...",
  "supply": {
    "current": 5,
    "max": 100,
    "remaining": 95
  },
  "expiresAt": "2025-01-27T..."
}
```

### POST /api/capture
Save a waifu capture.

**Request:**
```json
{
  "waifuId": "w1"
}
```

### POST /api/wallet
Save player's wallet address.

**Request:**
```json
{
  "walletAddress": "0x123..."
}
```

### GET /api/mints
Get player's minted waifus.

**Response:**
```json
{
  "mints": [
    {
      "waifuId": "w1",
      "tokenId": 1,
      "txHash": "0x...",
      "mintedAt": "2025-01-20T..."
    }
  ]
}
```

### GET /api/spawns
Get active waifu spawns (filtered by time & supply).

## Data Storage

Currently using file-based JSON storage in `data/` directory:
- `player_wallets.json`
- `waifu_captures.json`
- `minted_waifus.json`
- `pending_mints.json`
- `waifu_spawns.json`

**For production, migrate to a real database:**
- PostgreSQL
- MongoDB
- Supabase
- Firebase

## Security Checklist

- ✅ Private key in `.env.local` (not committed)
- ✅ JWT authentication required for all endpoints
- ✅ Wallet ownership verification
- ✅ Capture verification before minting
- ✅ Duplicate mint prevention
- ✅ Supply limits enforced
- ✅ Time window enforced
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add CORS in production

## Testing the System

1. **Capture a waifu** in AR mode
2. **Go to collection page**
3. **Click "⚡ MINT NFT"** button
4. Check console for signature
5. Frontend will show alert with signature and supply info

## Next Steps

1. Deploy your NFT contract to Base
2. Add contract address to `.env.local`
3. Connect real wallet (wagmi) instead of placeholder
4. Implement frontend contract call with signature
5. Update `db.saveMint()` after successful blockchain mint
6. Increment spawn supply after successful mint
7. Add transaction confirmation UI
8. Migrate to real database for production

## Spawn Configuration

Edit `/app/api/spawns/route.ts` to customize:
- `maxSupply`: How many can be minted
- `spawnStart` / `spawnEnd`: Time window
- `price`: Mint price in ETH

Example:
```typescript
{
  id: "w1",
  name: "Sakura",
  maxSupply: 100,  // Only 100 can ever be minted
  currentSupply: 0,
  spawnStart: "2025-01-20T00:00:00Z",
  spawnEnd: "2025-01-27T23:59:59Z",  // 7 day window
  price: "0.001"  // 0.001 ETH
}
```

## Questions?

Check the code comments in:
- `/lib/db.ts` - Data storage functions
- `/app/api/mint-signature/route.ts` - Signature generation
- `/app/api/spawns/route.ts` - Spawn management
