import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { createClient } from "@farcaster/quick-auth";
import { PublicKey } from '@solana/web3.js';

const client = createClient();

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

// POST - Save player's wallet address
export async function POST(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing walletAddress' },
        { status: 400 }
      );
    }

    // Validate Solana address
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 }
      );
    }

    // Save wallet (no toLowerCase for Solana addresses - they're case-sensitive base58)
    await db.savePlayerWallet({
      fid,
      wallet_address: walletAddress,
      created_at: new Date().toISOString()
    });

    console.log('Wallet saved:', { fid, walletAddress });

    return NextResponse.json({
      success: true,
      fid,
      walletAddress
    });

  } catch (error) {
    console.error('Error saving wallet:', error);
    return NextResponse.json(
      { error: 'Failed to save wallet' },
      { status: 500 }
    );
  }
}

// GET - Get player's wallet address
export async function GET(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const wallet = await db.getPlayerWallet(fid);

    if (!wallet) {
      return NextResponse.json(
        { connected: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      connected: true,
      walletAddress: wallet.wallet_address,
      createdAt: wallet.created_at
    });

  } catch (error) {
    console.error('Error getting wallet:', error);
    return NextResponse.json(
      { error: 'Failed to get wallet' },
      { status: 500 }
    );
  }
}
