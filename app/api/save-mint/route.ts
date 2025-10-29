import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { getAuthenticatedUser } from '@/lib/auth';

// POST - Save a successful mint
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { waifuId, txHash, tokenId } = await request.json();

    if (!waifuId || !txHash) {
      return NextResponse.json(
        { error: 'Missing waifuId or txHash' },
        { status: 400 }
      );
    }

    console.log('Saving mint:', { userId: user.userId, waifuId, txHash, tokenId });

    // Save mint to database
    await db.saveMint({
      fid: user.userId,
      waifu_id: waifuId,
      token_id: tokenId,
      tx_hash: txHash,
      minted_at: new Date().toISOString()
    });

    console.log('Mint saved successfully');

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error saving mint:', error);
    return NextResponse.json(
      { error: 'Failed to save mint' },
      { status: 500 }
    );
  }
}
