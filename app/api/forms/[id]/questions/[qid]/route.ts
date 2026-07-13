import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; qid: string } }
) {
  const { userId } = auth();
  const { id: formId, qid: questionId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('user_id')
      .eq('id', formId)
      .single();

    if (formError || !form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { text, type, is_required, order_index } = body;

    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (type !== undefined) updateData.type = type;
    if (is_required !== undefined) updateData.is_required = is_required;
    if (order_index !== undefined) updateData.order_index = order_index;

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .eq('form_id', formId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH /api/forms/[id]/questions/[qid] error:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; qid: string } }
) {
  const { userId } = auth();
  const { id: formId, qid: questionId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('user_id')
      .eq('id', formId)
      .single();

    if (formError || !form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
      .eq('form_id', formId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/forms/[id]/questions/[qid] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}