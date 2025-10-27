import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { createClient } from "@farcaster/quick-auth";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const client = createClient();

// Environment variables
const GAME_SIGNER_PRIVATE_KEY = process.env.GAME_SIGNER_PRIVATE_KEY!; // Base58 encoded Solana keypair
const SOLANA_PROGRAM_ID = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!;

// Get authenticated user FID from JWT
async function getAuthenticatedFid(request: NextRequest): Promise<number | null> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorization.split(" ")[1];
    const domain = request.headers.get("host")?.replace('www.', '') || 'waifuverse.fun';

    // Try both domain variants
    let payload;
    try {
      payload = await client.verifyJwt({ token, domain });
    } catch {
      payload = await client.verifyJwt({ token, domain: `www.${domain}` });
    }

    return Number(payload.sub);
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated player from JWT
    const fid = await getAuthenticatedFid(request);
    console.log('Mint signature request - FID:', fid);

    if (!fid) {
      console.error('Mint signature - No FID found, auth failed');
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { playerAddress, waifuId } = await request.json();
    console.log('Request data:', { playerAddress, waifuId });

    if (!playerAddress || !waifuId) {
      console.error('Missing data:', { playerAddress, waifuId });
      return NextResponse.json(
        { error: 'Missing playerAddress or waifuId' },
        { status: 400 }
      );
    }

    // Validate Solana address format
    try {
      new PublicKey(playerAddress);
    } catch {
      console.error('Invalid Solana address format:', playerAddress);
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 }
      );
    }

    // 2. Verify this wallet belongs to this player
    const playerWallet = await db.getPlayerWallet(fid);
    console.log('Player wallet from DB:', playerWallet);
    if (!playerWallet || playerWallet.wallet_address !== playerAddress) {
      console.error('Wallet mismatch:', {
        dbWallet: playerWallet?.wallet_address,
        requestWallet: playerAddress
      });
      return NextResponse.json(
        { error: 'Wallet does not belong to this player - please connect your wallet first' },
        { status: 403 }
      );
    }

    // 3. Get waifu spawn data
    const spawn = await db.getSpawnById(waifuId);
    console.log('Spawn data:', spawn ? { id: spawn.id, name: spawn.name } : 'NOT FOUND');
    if (!spawn) {
      console.error('Waifu not found:', waifuId);
      return NextResponse.json(
        { error: 'Waifu not found' },
        { status: 404 }
      );
    }

    // 4. Check if spawn is still active
    const now = new Date();
    const spawnEnd = new Date(spawn.spawn_end);
    console.log('Spawn time check:', { now, spawnEnd, expired: now > spawnEnd });
    if (now > spawnEnd) {
      console.error('Spawn expired:', { now, spawnEnd });
      return NextResponse.json(
        { error: 'This waifu spawn has expired' },
        { status: 400 }
      );
    }

    // 5. Check if supply is available
    console.log('Supply check:', { current: spawn.current_supply, max: spawn.max_supply });
    if (spawn.current_supply >= spawn.max_supply) {
      console.error('Supply exhausted:', { current: spawn.current_supply, max: spawn.max_supply });
      return NextResponse.json(
        { error: 'All copies of this waifu have been minted' },
        { status: 400 }
      );
    }

    // 6. Check if player captured this waifu
    const hasCapture = await db.hasCapture(fid, waifuId);
    console.log('Has capture:', hasCapture);
    if (!hasCapture) {
      console.error('Player has not captured this waifu:', { fid, waifuId });
      return NextResponse.json(
        { error: 'You have not captured this waifu yet' },
        { status: 400 }
      );
    }

    // 7. Check if already minted
    const alreadyMinted = await db.hasMinted(fid, waifuId);
    console.log('Already minted:', alreadyMinted);
    if (alreadyMinted) {
      console.error('Already minted:', { fid, waifuId });
      return NextResponse.json(
        { error: 'You already minted this waifu' },
        { status: 400 }
      );
    }

    // 8. Check if signer key is configured
    if (!GAME_SIGNER_PRIVATE_KEY || GAME_SIGNER_PRIVATE_KEY === 'your_private_key_here') {
      console.error('GAME_SIGNER_PRIVATE_KEY not configured');
      return NextResponse.json(
        { error: 'Server not configured for minting - contact admin' },
        { status: 500 }
      );
    }

    // 9. Generate Solana transaction signature
    // Decode the keypair from base58
    const signerKeypair = Keypair.fromSecretKey(bs58.decode(GAME_SIGNER_PRIVATE_KEY));

    // Create a message to sign that includes the mint authorization
    // This will be verified on-chain by your Solana program
    const message = Buffer.from(
      JSON.stringify({
        player: playerAddress,
        waifuId: spawn.contract_token_id,
        timestamp: Date.now(),
        price: spawn.price
      })
    );

    // Sign the message with the authority keypair
    // Using nacl for ed25519 signing
    const nacl = await import('tweetnacl');
    const signatureBytes = nacl.sign.detached(message, signerKeypair.secretKey);
    const signature = bs58.encode(signatureBytes);

    // 10. Store pending mint
    await db.savePendingMint({
      fid,
      waifu_id: waifuId,
      signature,
      created_at: new Date().toISOString()
    });

    console.log('Mint signature generated:', {
      fid,
      waifuId,
      playerAddress,
      signaturePreview: signature.substring(0, 20) + '...'
    });

    // 11. Return signature and mint data
    return NextResponse.json({
      signature,
      waifuId,
      contractTokenId: spawn.contract_token_id,
      price: spawn.price, // Price in lamports (1 SOL = 1_000_000_000 lamports)
      priceInSol: Number(spawn.price) / LAMPORTS_PER_SOL,
      programId: SOLANA_PROGRAM_ID,
      authorityPubkey: signerKeypair.publicKey.toBase58(),
      supply: {
        current: spawn.current_supply,
        max: spawn.max_supply,
        remaining: spawn.max_supply - spawn.current_supply
      },
      expiresAt: spawn.spawn_end
    });

  } catch (error) {
    console.error('Error generating mint signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
