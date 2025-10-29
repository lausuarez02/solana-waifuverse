import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { getAuthenticatedUser } from '@/lib/auth';

// POST - Save a waifu capture
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
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
    const hasCapture = await db.hasCapture(user.userId, waifuId);
    if (hasCapture) {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true
      });
    }

    // Save capture
    await db.saveCapture({
      fid: user.userId,
      waifu_id: waifuId,
      captured_at: new Date().toISOString()
    });

    console.log('Capture saved:', { userId: user.userId, wallet: user.wallet, waifuId });

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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const captures = await db.getCaptures(user.userId);

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
