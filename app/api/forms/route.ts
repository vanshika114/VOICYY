import { auth } from '@clerk/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();

    console.log('Clerk userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No userId from Clerk' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/forms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    console.log('Clerk userId (POST):', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No userId from Clerk' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('forms')
      .insert({
        title,
        description: description || '',
        is_published: false,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/forms error:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}