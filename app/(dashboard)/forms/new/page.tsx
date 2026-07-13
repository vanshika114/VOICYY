'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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
      // First, ensure user exists in our users table
      await supabase.from('users').upsert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName + ' ' + user.lastName,
      });

      // Create the form
      const { data, error } = await supabase
        .from('forms')
        .insert({
          title,
          description,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/forms/${data.id}/edit`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
        <p className="text-gray-600 mt-1">Start collecting voice feedback</p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product Feedback"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell respondents what this form is about..."
              rows={4}
              className="input"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Form'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}