import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { getAuthenticatedUser } from '@/lib/auth';
import { PublicKey } from '@solana/web3.js';

// POST - Save player's wallet address
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
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

    // Verify the wallet address matches the authenticated wallet
    if (walletAddress !== user.wallet) {
      return NextResponse.json(
        { error: 'Wallet address does not match authenticated wallet' },
        { status: 403 }
      );
    }

    // Save wallet (no toLowerCase for Solana addresses - they're case-sensitive base58)
    await db.savePlayerWallet({
      fid: user.userId,
      wallet_address: walletAddress,
      created_at: new Date().toISOString()
    });

    console.log('Wallet saved:', { userId: user.userId, walletAddress });

    return NextResponse.json({
      success: true,
      userId: user.userId,
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const wallet = await db.getPlayerWallet(user.userId);

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
