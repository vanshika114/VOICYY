import { auth } from '@clerk/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { data, error } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Allow access if form is published OR if user is the creator
    const { userId } = auth();
    if (!data.is_published && userId !== data.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/forms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  const { id } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify ownership
    const { data: form, error: fetchError } = await supabaseServer
      .from('forms')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, is_published } = body;

    const { data, error } = await supabaseServer
      .from('forms')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(is_published !== undefined && { is_published }),
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH /api/forms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  const { id } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify ownership
    const { data: form, error: fetchError } = await supabaseServer
      .from('forms')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabaseServer
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/forms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}