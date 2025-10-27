import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Check admin password
    const adminPassword = formData.get('adminPassword') as string;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    console.log('Upload auth check:', {
      receivedPassword: adminPassword ? '***' : 'MISSING',
      expectedPassword: expectedPassword ? '***' : 'NOT SET',
      match: adminPassword === expectedPassword
    });

    if (adminPassword !== expectedPassword) {
      return NextResponse.json({
        error: 'Unauthorized - invalid admin password'
      }, { status: 401 });
    }

    const file = formData.get('file') as File;
    const waifuId = formData.get('waifuId') as string;
    const isCaptured = formData.get('isCaptured') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${waifuId}_${isCaptured ? 'captured' : 'normal'}_${Date.now()}.${fileExt}`;
    const filePath = `waifus/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('waifus')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('waifus')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
