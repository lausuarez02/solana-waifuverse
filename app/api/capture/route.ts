import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

// Get authenticated user public key from JWT
async function getAuthenticatedPublicKey(request: NextRequest): Promise<string | null> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.publicKey;
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

// POST - Save a waifu capture
export async function POST(request: NextRequest) {
  try {
    const publicKey = await getAuthenticatedPublicKey(request);
    if (!publicKey) {
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

    // Use publicKey as user identifier instead of fid
    const hasCapture = await db.hasCapture(publicKey, waifuId);
    if (hasCapture) {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true
      });
    }

    // Save capture
    await db.saveCapture({
      fid: publicKey, // Store publicKey in fid field for now
      waifu_id: waifuId,
      captured_at: new Date().toISOString()
    });

    console.log('Capture saved:', { publicKey, waifuId });

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
    const publicKey = await getAuthenticatedPublicKey(request);
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const captures = await db.getCaptures(publicKey);

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
