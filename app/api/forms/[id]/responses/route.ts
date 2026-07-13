import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  const { id: formId } = params;

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

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (responsesError) throw responsesError;

    // Get answers for each response
    const responsesWithAnswers = await Promise.all(
      (responses || []).map(async (response) => {
        const { data: answers } = await supabase
          .from('answers')
          .select('*')
          .eq('response_id', response.id)
          .order('created_at', { ascending: true });

        return {
          ...response,
          answers: answers || [],
        };
      })
    );

    return NextResponse.json(responsesWithAnswers);
  } catch (error) {
    console.error('GET /api/forms/[id]/responses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: formId } = params;

  try {
    // Verify form is published
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('is_published')
      .eq('id', formId)
      .single();

    if (formError || !form || !form.is_published) {
      return NextResponse.json(
        { error: 'Form is not published' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Create response
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({ form_id: formId })
      .select()
      .single();

    if (responseError) throw responseError;

    // Insert answers
    const answersToInsert = answers.map((answer: any) => ({
      response_id: response.id,
      question_id: answer.question_id,
      answer_type: answer.answer_type,
      text_content: answer.text_content || null,
      audio_url: answer.audio_url || null,
      duration_seconds: answer.duration_seconds || null,
    }));

    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;

    return NextResponse.json(
      { id: response.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/forms/[id]/responses error:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}