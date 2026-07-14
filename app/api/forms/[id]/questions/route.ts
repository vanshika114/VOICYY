import { auth } from '@clerk/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  const { id: formId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify form ownership
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('user_id')
      .eq('id', formId)
      .single();

    if (formError || !form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { text, type = 'voice', is_required = false } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    // Get the next order index
    const { data: lastQuestion } = await supabaseServer
      .from('questions')
      .select('order_index')
      .eq('form_id', formId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = lastQuestion && lastQuestion.length > 0
      ? lastQuestion[0].order_index + 1
      : 0;

    const { data, error } = await supabaseServer
      .from('questions')
      .insert({
        form_id: formId,
        text,
        type,
        is_required,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/forms/[id]/questions error:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}