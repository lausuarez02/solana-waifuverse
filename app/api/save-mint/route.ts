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

// POST - Save a successful mint
export async function POST(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
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

    console.log('Saving mint:', { fid, waifuId, txHash, tokenId });

    // Save mint to database
    await db.saveMint({
      fid,
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
