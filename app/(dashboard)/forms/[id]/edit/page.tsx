'use client';

import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      setForm(formData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
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
      const { error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', formId);

      if (error) throw error;
      setForm({ ...form, ...updates } as Form);
    } catch (error) {
      console.error('Failed to update form:', error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    const newIndex = Math.max(...questions.map(q => q.order_index), -1) + 1;

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          form_id: formId,
          text: 'New question',
          type: 'voice',
          is_required: false,
          order_index: newIndex,
        })
        .select()
        .single();

      if (error) throw error;
      setQuestions([...questions, data]);
    } catch (error) {
      console.error('Failed to add question:', error);
      alert('Failed to add question');
    }
  };

  const updateQuestion = async (qId: string, updates: Partial<Question>) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', qId);

      if (error) throw error;
      setQuestions(
        questions.map(q => (q.id === qId ? { ...q, ...updates } : q))
      );
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to save');
    }
  };

  const deleteQuestion = async (qId: string) => {
    if (!confirm('Delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', qId);

      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== qId));
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete');
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

    for (const q of newQuestions) {
      await supabase
        .from('questions')
        .update({ order_index: newQuestions.indexOf(q) })
        .eq('id', q.id);
    }
  };

  const publishForm = async () => {
    if (questions.length === 0) {
      alert('Add at least one question before publishing');
      return;
    }

    await updateForm({ is_published: true });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !form) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onBlur={() => updateForm({ title: form.title })}
            className="text-3xl font-bold text-gray-900 bg-transparent border-none p-0 focus:outline-none mb-2 w-full"
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            onBlur={() => updateForm({ description: form.description })}
            placeholder="Form description..."
            className="input"
            rows={2}
          />
        </div>

        <div className="ml-4 space-y-2">
          {form.is_published ? (
            <>
              <button
                onClick={copyLink}
                className="block w-full bg-green-50 text-green-700 px-4 py-2 rounded hover:bg-green-100 font-medium text-sm"
              >
                {copied ? '✓ Copied' : 'Copy Link'}
              </button>
              <p className="text-xs text-gray-500">Published</p>
            </>
          ) : (
            <button
              onClick={publishForm}
              disabled={saving}
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm disabled:bg-gray-400"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
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
              className="input text-lg font-semibold mb-4 p-0 border-none focus:outline-none focus:ring-0"
            />

            <div className="flex gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Type</label>
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(q.id, { type: e.target.value as 'voice' | 'text' })
                  }
                  className="input mt-1"
                >
                  <option value="voice">Voice</option>
                  <option value="text">Text</option>
                </select>
              </div>

              <label className="flex items-end gap-2">
                <input
                  type="checkbox"
                  checked={q.is_required}
                  onChange={(e) =>
                    updateQuestion(q.id, { is_required: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => moveQuestion(idx, 'up')}
                disabled={idx === 0}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestion(idx, 'down')}
                disabled={idx === questions.length - 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↓
              </button>
              <button
                onClick={() => deleteQuestion(q.id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        className="mt-6 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
      >
        + Add Question
      </button>
    </div>
  );
}