'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const confirmed = await new Promise<boolean>((resolve) => {
      toast('Delete this response?', {
        action: {
          label: 'Delete',
          onClick: () => resolve(true),
        },
        cancel: {
          label: 'Cancel',
          onClick: () => resolve(false),
        },
      });
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/forms/${formId}/responses/${responseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setResponses(responses.filter(r => r.id !== responseId));
    } catch (error) {
      console.error('Failed to delete response:', error);
      toast.error('Failed to delete response');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 font-medium text-sm mb-6 transition-all duration-fast"
        >
          <svg className="w-4 h-4 transition-transform duration-fast group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to form
        </button>
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Responses
          </h1>
          <span className="text-lg text-neutral-400">/</span>
          <h2 className="text-2xl font-semibold text-neutral-700">{formTitle}</h2>
        </div>
        <p className="text-neutral-500 mt-2 text-sm font-medium">
          {responses.length} submission{responses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 skeleton rounded-xl"></div>
                  <div>
                    <div className="h-4 w-24 skeleton rounded-lg mb-1"></div>
                    <div className="h-3 w-32 skeleton rounded-lg"></div>
                  </div>
                </div>
                <div className="h-9 w-20 skeleton rounded-xl"></div>
              </div>
              <div className="p-6 space-y-5">
                {[1, 2].map((j) => (
                  <div key={j} className="flex gap-4">
                    <div className="w-8 h-8 skeleton rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-5 w-3/4 skeleton rounded-lg mb-3"></div>
                      <div className="h-24 w-full skeleton rounded-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm animate-scale-in animate-pulse-soft">
            <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            No responses yet
          </h3>
          <p className="text-neutral-500 max-w-md text-center leading-relaxed">
            Share your form link to start collecting feedback from your audience
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {responses.map((response, index) => (
            <div
              key={response.id}
              className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-fast overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      Submission #{index + 1}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(response.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(response.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteResponse(response.id)}
                  className="group/delete flex items-center gap-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-fast hover:shadow-sm"
                >
                  <svg className="w-4 h-4 transition-transform duration-fast group-hover/delete:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>

              <div className="p-6 space-y-5">
                {response.answers.map((answer, answerIndex) => (
                  <div key={answer.id} className="relative">
                    {answerIndex !== response.answers.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-neutral-200 to-transparent"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${answer.answer_type === 'voice' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} shadow-sm`}>
                        {answer.answer_type === 'voice' ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 mb-3 text-base leading-snug">
                          {answer.question_text}
                        </h4>

                        {answer.answer_type === 'voice' && answer.audio_url ? (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl border border-purple-200">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <audio
                                  controls
                                  src={answer.audio_url}
                                  className="w-full h-10"
                                />
                              </div>
                              {answer.duration_seconds && (
                                <div className="flex-shrink-0 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                                  <span className="text-sm font-semibold text-purple-700">
                                    {Math.floor(answer.duration_seconds / 60)}:{(answer.duration_seconds % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : answer.answer_type === 'text' && answer.text_content ? (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-200">
                            <p className="text-neutral-800 leading-relaxed">
                              {answer.text_content}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 border-dashed">
                            <p className="text-neutral-400 italic text-sm">
                              No answer provided
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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