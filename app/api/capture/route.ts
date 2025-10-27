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

// POST - Save a waifu capture
export async function POST(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { waifuId } = await request.json();

    if (!waifuId) {
      return NextResponse.json(
        { error: 'Missing waifuId' },
        { status: 400 }
      );
    }

    // Check if already captured
    const hasCapture = await db.hasCapture(fid, waifuId);
    if (hasCapture) {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true
      });
    }

    // Save capture
    await db.saveCapture({
      fid,
      waifu_id: waifuId,
      captured_at: new Date().toISOString()
    });

    console.log('Capture saved:', { fid, waifuId });

    return NextResponse.json({
      success: true,
      alreadyCaptured: false
    });

  } catch (error) {
    console.error('Error saving capture:', error);
    return NextResponse.json(
      { error: 'Failed to save capture' },
      { status: 500 }
    );
  }
}

// GET - Get player's captures
export async function GET(request: NextRequest) {
  try {
    const fid = await getAuthenticatedFid(request);
    if (!fid) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const captures = await db.getCaptures(fid);

    return NextResponse.json({
      captures: captures.map(c => ({
        waifuId: c.waifu_id,
        capturedAt: c.captured_at
      }))
    });

  } catch (error) {
    console.error('Error getting captures:', error);
    return NextResponse.json(
      { error: 'Failed to get captures' },
      { status: 500 }
    );
  }
}
