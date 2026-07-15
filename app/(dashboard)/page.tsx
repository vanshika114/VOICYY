'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Form {
  id: string;
  title: string;
  created_at: string;
  is_published: boolean;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms', { credentials: 'include' });
      console.log('Fetch response status:', res.status);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API error:', errorData);
        throw new Error(`Failed to fetch forms: ${res.status}`);
      }
      const data = await res.json();
      console.log('Forms data:', data);
      setForms(data || []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast('Delete this form? This cannot be undone.', {
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
      const res = await fetch(`/api/forms/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete');
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast.error('Failed to delete form');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">My Forms</h1>
          <p className="text-neutral-600 mt-1">Create and manage your voice forms</p>
        </div>
        <Link
          href="/forms/new"
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-sm hover:shadow-md transition-all duration-fast"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Form
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-6 w-3/4 skeleton rounded-lg mb-2"></div>
                </div>
                <div className="h-6 w-16 skeleton rounded-full flex-shrink-0 ml-2"></div>
              </div>
              <div className="h-4 w-1/2 skeleton rounded-lg mb-5"></div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 skeleton rounded-xl"></div>
                <div className="flex-1 h-10 skeleton rounded-xl"></div>
                <div className="w-10 h-10 skeleton rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4 animate-scale-in">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No forms yet
          </h3>
          <p className="text-neutral-600 mb-6 max-w-sm text-center">
            Create your first form to start collecting voice feedback
          </p>
          <Link
            href="/forms/new"
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-medium shadow-sm hover:shadow-md transition-all duration-fast"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white p-6 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-fast group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex-1 line-clamp-2">
                  {form.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                    form.is_published
                      ? 'bg-success-50 text-success-700 border border-success-200'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  }`}
                >
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-neutral-500 mb-5">
                Created {new Date(form.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/forms/${form.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-700 px-3 py-2.5 rounded-xl hover:bg-primary-100 font-medium text-sm transition-all duration-fast hover:shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <Link
                  href={`/forms/${form.id}/responses`}
                  className="flex-1 flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 px-3 py-2.5 rounded-xl hover:bg-neutral-200 font-medium text-sm transition-all duration-fast hover:shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Responses
                </Link>
                <button
                  onClick={() => deleteForm(form.id)}
                  className="px-3 py-2.5 text-danger-600 hover:bg-danger-50 rounded-xl font-medium text-sm transition-all duration-fast flex items-center justify-center hover:shadow-sm"
                  title="Delete form"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}