'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Form {
  id: string;
  title: string;
  created_at: string;
  is_published: boolean;
  response_count?: number;
}

export default function FormsPage() {
  const { user } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchForms();
  }, [user]);

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Delete this form? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Failed to delete form');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-600 mt-1">Create and manage your voice forms</p>
        </div>
        <Link
          href="/forms/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + New Form
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No forms yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first form to start collecting voice feedback
          </p>
          <Link
            href="/forms/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {form.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    form.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Created {new Date(form.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/forms/${form.id}/edit`}
                  className="flex-1 text-center bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 font-medium text-sm"
                >
                  Edit
                </Link>
                <Link
                  href={`/forms/${form.id}/responses`}
                  className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 font-medium text-sm"
                >
                  Responses
                </Link>
                <button
                  onClick={() => deleteForm(form.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}