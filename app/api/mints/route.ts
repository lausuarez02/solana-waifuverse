import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Get player's minted waifus
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const mints = await db.getMints(user.userId);

    return NextResponse.json({
      mints: mints.map(m => ({
        waifuId: m.waifu_id,
        tokenId: m.token_id,
        txHash: m.tx_hash,
        mintedAt: m.minted_at
      }))
    });

  } catch (error) {
    console.error('Error getting mints:', error);
    return NextResponse.json(
      { error: 'Failed to get mints' },
      { status: 500 }
    );
  }
}
