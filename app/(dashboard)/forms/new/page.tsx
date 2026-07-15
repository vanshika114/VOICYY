'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewFormPage() {
  const { user } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error('Failed to create form');
      const data = await res.json();
      router.push(`/forms/${data.id}/edit`);
    } catch (error) {
      console.error('Failed to create form:', error);
      toast.error('Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-4 transition-all duration-fast"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Create New Form</h1>
        <p className="text-neutral-600 mt-1">Start collecting voice feedback</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product Feedback"
              className="input focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell respondents what this form is about..."
              rows={4}
              className="input resize-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-medium disabled:bg-neutral-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-fast"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Form
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-xl hover:bg-neutral-200 font-medium transition-all duration-fast"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}