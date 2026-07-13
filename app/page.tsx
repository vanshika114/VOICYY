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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">VOICYY</h1>
          <div className="space-x-4">
            <Link
              href="/sign-in"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Collect voice feedback like text
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Create forms that let respondents answer with their voice. No typing. No friction. Just conversations.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          Start Building Free
        </Link>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How it works
          </h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Create a form
              </h4>
              <p className="text-gray-600">
                Add questions. Set which ones are required. Publish.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Share the link
              </h4>
              <p className="text-gray-600">
                Copy the public link. Send it to anyone. No signup needed.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Listen to feedback
              </h4>
              <p className="text-gray-600">
                Review responses. Play recordings. Get insights directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>&copy; 2025 VOICYY. Built for collecting voice feedback.</p>
        </div>
      </footer>
    </div>
  );
}