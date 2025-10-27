import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { createClient } from "@farcaster/quick-auth";

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

// GET - Get player's minted waifus
export async function GET(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const mints = await db.getMints(fid);

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
