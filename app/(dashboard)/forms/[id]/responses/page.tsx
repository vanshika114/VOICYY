'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Answer {
  id: string;
  question_id: string;
  question_text: string;
  answer_type: 'voice' | 'text';
  text_content: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
}

interface Response {
  id: string;
  created_at: string;
  answers: Answer[];
}

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    try {
      // Get form title
      const { data: formData } = await supabase
        .from('forms')
        .select('title')
        .eq('id', formId)
        .single();

      if (formData) setFormTitle(formData.title);

      // Get responses with answers
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (responsesError) throw responsesError;

      // For each response, get the answers
      const responsesWithAnswers = await Promise.all(
        (responsesData || []).map(async (response) => {
          const { data: answersData } = await supabase
            .from('answers')
            .select('*')
            .eq('response_id', response.id)
            .order('created_at', { ascending: true });

          // Get question text for each answer
          const answersWithText = await Promise.all(
            (answersData || []).map(async (answer) => {
              const { data: questionData } = await supabase
                .from('questions')
                .select('text')
                .eq('id', answer.question_id)
                .single();

              return {
                ...answer,
                question_text: questionData?.text || 'Question',
              };
            })
          );

          return {
            ...response,
            answers: answersWithText,
          };
        })
      );

      setResponses(responsesWithAnswers);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = async (responseId: string) => {
    if (!confirm('Delete this response?')) return;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId);

      if (error) throw error;
      setResponses(responses.filter(r => r.id !== responseId));
    } catch (error) {
      console.error('Failed to delete response:', error);
      alert('Failed to delete response');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Back to form
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Responses to "{formTitle}"
        </h1>
        <p className="text-gray-600 mt-1">{responses.length} submission{responses.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading responses...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No responses yet
          </h3>
          <p className="text-gray-600">
            Share your form link to start collecting feedback
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {responses.map((response) => (
            <div
              key={response.id}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm text-gray-500">
                  Submitted{' '}
                  {new Date(response.created_at).toLocaleDateString()} at{' '}
                  {new Date(response.created_at).toLocaleTimeString()}
                </p>
                <button
                  onClick={() => deleteResponse(response.id)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-6">
                {response.answers.map((answer) => (
                  <div key={answer.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {answer.question_text}
                    </h4>

                    {answer.answer_type === 'voice' && answer.audio_url ? (
                      <div className="flex items-center gap-4">
                        <audio
                          controls
                          src={answer.audio_url}
                          className="flex-1"
                        />
                        {answer.duration_seconds && (
                          <span className="text-sm text-gray-500">
                            {answer.duration_seconds}s
                          </span>
                        )}
                      </div>
                    ) : answer.answer_type === 'text' && answer.text_content ? (
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {answer.text_content}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">No answer provided</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}