import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const formId = formData.get('form_id') as string;

    if (!file || !formId) {
      return NextResponse.json(
        { error: 'File and form_id are required' },
        { status: 400 }
      );
    }

    // Validate file is audio
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be audio' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${formId}/${timestamp}.webm`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from('voiceforms-audio')
      .upload(fileName, uint8Array, {
        contentType: 'audio/webm',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseServer.storage
      .from('voiceforms-audio')
      .getPublicUrl(fileName);

    return NextResponse.json(
      {
        url: publicUrlData.publicUrl,
        fileName: data.path,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}