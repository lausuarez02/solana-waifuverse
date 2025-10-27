import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

export async function POST(request: NextRequest) {
  try {
    const waifuData = await request.json();

    // Check admin password
    if (waifuData.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove password before saving to database
    delete waifuData.adminPassword;

    // Validate required fields
    if (!waifuData.id || !waifuData.name || !waifuData.img || !waifuData.capturedImg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add the waifu to database
    await db.initializeSpawns([waifuData]);

    return NextResponse.json({
      success: true,
      message: `Waifu ${waifuData.name} added successfully`,
      waifuId: waifuData.id
    });

  } catch (error) {
    console.error('Failed to add waifu:', error);
    return NextResponse.json(
      { error: 'Failed to add waifu' },
      { status: 500 }
    );
  }
}
