'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      // Fetch form title
      const formRes = await fetch(`/api/forms/${formId}`, { credentials: 'include' });
      if (formRes.ok) {
        const formData = await formRes.json();
        setFormTitle(formData.title);
      }

      // Fetch responses via API
      const responsesRes = await fetch(`/api/forms/${formId}/responses`, { credentials: 'include' });
      if (!responsesRes.ok) throw new Error('Failed to fetch responses');
      
      const responsesData = await responsesRes.json();
      setResponses(responsesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = async (responseId: string) => {
    if (!confirm('Delete this response?')) return;

    try {
      const res = await fetch(`/api/forms/${formId}/responses/${responseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
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