'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RecordingButton } from '@/components/RecordingButton';
import { AudioPlayer } from '@/components/AudioPlayer';

interface Question {
  id: string;
  text: string;
  type: 'voice' | 'text';
  is_required: boolean;
}

interface Form {
  id: string;
  title: string;
  description: string;
}

interface Answer {
  questionId: string;
  answerType: 'voice' | 'text';
  audioUrl?: string;
  textContent?: string;
  duration?: number;
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (!res.ok) throw new Error('Form not found');
      
      const formData = await res.json();
      setForm(formData);

      const questionsData = formData.questions || [];
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch form:', error);
      alert('Form not found or is not published');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const uploadAudio = async (blob: Blob): Promise<string> => {
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('form_id', formId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('Failed to upload audio:', error);
      throw error;
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    try {
      const audioUrl = await uploadAudio(blob);
      setRecordedUrl(audioUrl);
      setRecordedDuration(duration);

      const currentQuestion = questions[currentQuestionIndex];
      answers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        answerType: 'voice',
        audioUrl,
        duration,
      });
      setAnswers(new Map(answers));
    } catch (error) {
      alert('Failed to upload recording');
    }
  };

  const handleTextChange = (text: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    answers.set(currentQuestion.id, {
      questionId: currentQuestion.id,
      answerType: 'text',
      textContent: text,
    });
    setAnswers(new Map(answers));
  };

  const handleReRecord = () => {
    setRecordedUrl(null);
    setRecordedDuration(0);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRecordedUrl(null);
      setRecordedDuration(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setRecordedUrl(null);
      setRecordedDuration(0);
    }
  };

  const handleSubmit = async () => {
    // Validate required questions
    for (const question of questions) {
      if (question.is_required && !answers.has(question.id)) {
        alert(`Please answer "${question.text}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const answersArray = Array.from(answers.values()).map((answer) => ({
        question_id: answer.questionId,
        answer_type: answer.answerType,
        text_content: answer.textContent || null,
        audio_url: answer.audioUrl || null,
        duration_seconds: answer.duration || null,
      }));

      const res = await fetch(`/api/forms/${formId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      alert('Thanks for your feedback!');
      router.push('/');
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading form...</p>
      </div>
    );
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
          <p className="text-gray-600">This form doesn't exist or has no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.id);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto py-12">
        {/* Form Header */}
        {currentQuestionIndex === 0 && (
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {currentQuestion.text}
          </h2>

          {/* Voice Recording */}
          {currentQuestion.type === 'voice' && (
            <div className="space-y-6">
              {!recordedUrl ? (
                <div className="flex justify-center">
                  <RecordingButton
                    onRecordingComplete={handleRecordingComplete}
                    disabled={uploadingAudio}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <AudioPlayer
                    url={recordedUrl}
                    durationSeconds={recordedDuration}
                  />
                  <button
                    onClick={handleReRecord}
                    className="block mx-auto text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                  >
                    Re-record
                  </button>
                </div>
              )}

              {/* Text Fallback */}
              <div className="pt-6 border-t">
                <label className="block text-sm text-gray-600 mb-3">
                  Or type your answer (optional)
                </label>
                <textarea
                  value={currentAnswer?.textContent || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* Text Only */}
          {currentQuestion.type === 'text' && (
            <textarea
              value={currentAnswer?.textContent || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}