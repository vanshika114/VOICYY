'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <div className="min-h-screen bg-white" />;
  }

  if (isSignedIn) {
    redirect('/forms');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            VOICYY
          </h1>
          <div className="space-x-4">
            <Link
              href="/sign-in"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-all duration-fast"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 font-medium transition-all duration-fast shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-neutral-900 mb-6 leading-tight tracking-tight">
            Collect voice feedback{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              like text
            </span>
          </h2>
          <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create forms that let respondents answer with their voice. No typing. No friction. Just conversations.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 font-medium text-lg transition-all duration-fast shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Building Free
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-neutral-900 mb-12 text-center tracking-tight">
            How it works
          </h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                Create a form
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Add questions. Set which ones are required. Publish.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                Share the link
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Copy the public link. Send it to anyone. No signup needed.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                Listen to feedback
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Review responses. Play recordings. Get insights directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-neutral-600 text-sm">
          <p>&copy; 2025 VOICYY. Built for collecting voice feedback.</p>
        </div>
      </footer>
    </div>
  );
}