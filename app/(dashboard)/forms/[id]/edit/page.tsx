'use client';

import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  type: 'voice' | 'text';
  is_required: boolean;
  order_index: number;
}

interface Form {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
}

export default function FormEditorPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchForm();
  }, [user, formId]);

  const fetchForm = async () => {
    try {
      const formRes = await fetch(`/api/forms/${formId}`);
      if (!formRes.ok) throw new Error('Failed to fetch form');
      const formData = await formRes.json();
      setForm(formData);

      const questionsRes = await fetch(`/api/forms/${formId}/questions`);
      if (!questionsRes.ok) throw new Error('Failed to fetch questions');
      const questionsData = await questionsRes.json();
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Failed to fetch form:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = async (updates: Partial<Form>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update form');
      setForm({ ...form, ...updates } as Form);
    } catch (error) {
      console.error('Failed to update form:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'New question',
          type: 'voice',
          is_required: false,
        }),
      });

      if (!res.ok) throw new Error('Failed to add question');
      const data = await res.json();
      setQuestions([...questions, data]);
    } catch (error) {
      console.error('Failed to add question:', error);
      toast.error('Failed to add question');
    }
  };

  const updateQuestion = async (qId: string, updates: Partial<Question>) => {
    try {
      const res = await fetch(`/api/forms/${formId}/questions/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update question');
      setQuestions(
        questions.map(q => (q.id === qId ? { ...q, ...updates } : q))
      );
    } catch (error) {
      console.error('Failed to update question:', error);
      toast.error('Failed to save');
    }
  };

  const deleteQuestion = async (qId: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast('Delete this question?', {
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
      const res = await fetch(`/api/forms/${formId}/questions/${qId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete question');
      setQuestions(questions.filter(q => q.id !== qId));
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete');
    }
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];

    setQuestions(newQuestions);

    try {
      await Promise.all(
        newQuestions.map((q, idx) =>
          fetch(`/api/forms/${formId}/questions/${q.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: idx }),
          })
        )
      );
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      toast.error('Failed to save new order');
    }
  };

  const publishForm = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }

    await updateForm({ is_published: true });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !form) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="h-10 w-2/3 skeleton rounded-lg mb-3"></div>
              <div className="h-6 w-full skeleton rounded-lg"></div>
            </div>
            <div className="flex-shrink-0 pt-1">
              <div className="h-10 w-32 skeleton rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col gap-1 pt-1">
                  <div className="w-6 h-6 skeleton rounded"></div>
                  <div className="w-6 h-6 skeleton rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-6 w-3/4 skeleton rounded-lg mb-4"></div>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="h-8 w-20 skeleton rounded-lg"></div>
                    <div className="h-8 w-24 skeleton rounded-lg"></div>
                    <div className="ml-auto h-8 w-16 skeleton rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={() => updateForm({ title: form.title })}
              className="text-3xl font-bold text-neutral-900 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg mb-3 w-full tracking-tight placeholder-neutral-300 transition-all duration-fast"
              placeholder="Form title"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              onBlur={() => updateForm({ description: form.description })}
              placeholder="Add a description..."
              className="w-full text-neutral-600 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg resize-none placeholder-neutral-400 text-base transition-all duration-fast"
              rows={2}
            />
          </div>

          <div className="flex-shrink-0 pt-1">
            {form.is_published ? (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg hover:bg-emerald-100 font-medium text-sm transition-all duration-200 border border-emerald-200"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Published</span>
              </div>
            ) : (
              <button
                onClick={publishForm}
                disabled={saving}
                className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg hover:bg-neutral-800 font-medium text-sm disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-fast"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Publish
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-fast"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex flex-col gap-1 pt-1">
                <button
                  onClick={() => moveQuestion(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-fast hover:shadow-sm"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveQuestion(idx, 'down')}
                  disabled={idx === questions.length - 1}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all duration-fast hover:shadow-sm"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="flex-1">
                <textarea
                  value={q.text}
                  onChange={(e) =>
                    setQuestions(
                      questions.map(x =>
                        x.id === q.id ? { ...x, text: e.target.value } : x
                      )
                    )
                  }
                  onBlur={() => updateQuestion(q.id, { text: q.text })}
                  className="w-full text-base font-semibold text-neutral-900 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg resize-none placeholder-neutral-400 transition-all duration-fast"
                  rows={2}
                  placeholder="Enter your question"
                />

                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Type</label>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(q.id, { type: e.target.value as 'voice' | 'text' })
                      }
                      className="text-sm font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-fast"
                    >
                      <option value="voice">Voice</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.is_required}
                      onChange={(e) =>
                        updateQuestion(q.id, { is_required: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-all duration-fast"
                    />
                    <span className="text-sm font-medium text-neutral-600">Required</span>
                  </label>

                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="ml-auto text-sm text-neutral-400 hover:text-danger-600 hover:bg-danger-50 px-3 py-1.5 rounded-lg transition-all duration-fast font-medium hover:shadow-sm"
                    title="Delete question"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-neutral-50 text-neutral-600 px-6 py-4 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 font-medium transition-all duration-fast border-2 border-dashed border-neutral-200 hover:border-neutral-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Question
      </button>
    </div>
  );
}