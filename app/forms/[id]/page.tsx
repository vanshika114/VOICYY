'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RecordingButton } from '@/components/RecordingButton';
import { AudioPlayer } from '@/components/AudioPlayer';
import { toast } from 'sonner';

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
      setLoading(true);
      // Fetch form details
      const formRes = await fetch(`/api/forms/${formId}`);
      
      if (!formRes.ok) {
        throw new Error('Failed to fetch form');
      }

      const formData = await formRes.json();
      setForm(formData);

      // Fetch questions separately
      const questionsRes = await fetch(`/api/forms/${formId}/questions`);
      if (!questionsRes.ok) {
        throw new Error('Failed to fetch questions');
      }
      const questionsData = await questionsRes.json();


      // Ensure it's always an array
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error('Failed to fetch form:', error);

      setForm(null);
      setQuestions([]);

      toast.error('Form not found or is not published');
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
      toast.error('Failed to upload recording');
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
        toast.error(`Please answer "${question.text}"`);
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

      toast.success('Thanks for your feedback!');
      router.push('/');
    } catch (error) {
      console.error('Failed to submit form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-neutral-100 p-12 max-w-md animate-scale-in">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Form not found</h2>
          <p className="text-neutral-600">This form doesn't exist or has no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto py-8 sm:py-12 lg:py-16">
        {/* Form Header */}
        {currentQuestionIndex === 0 && (
          <div className="mb-16 text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4 tracking-tight leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-lg text-neutral-600 max-w-lg mx-auto leading-relaxed">{form.description}</p>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-2xl font-bold text-primary-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-10 tracking-tight leading-tight animate-slide-up">
            {currentQuestion.text}
            {currentQuestion.is_required && (
              <span className="text-danger-500 ml-1">*</span>
            )}
          </h2>

          {/* Voice Recording */}
          {currentQuestion.type === 'voice' && (
            <div className="space-y-8">
              {!recordedUrl ? (
                <div className="flex justify-center py-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <RecordingButton
                      onRecordingComplete={handleRecordingComplete}
                      disabled={uploadingAudio}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 border border-primary-100 shadow-sm">
                    <AudioPlayer
                      url={recordedUrl}
                      durationSeconds={recordedDuration}
                    />
                  </div>
                  <button
                    onClick={handleReRecord}
                    className="block mx-auto text-primary-600 hover:text-primary-700 font-semibold text-sm underline underline-offset-4 transition-all duration-fast hover:underline-offset-6"
                  >
                    Re-record your response
                  </button>
                </div>
              )}

              {/* Text Fallback */}
              <div className="pt-8 border-t border-neutral-200">
                <label className="block text-sm font-semibold text-neutral-600 mb-4 uppercase tracking-wide">
                  Or type your answer (optional)
                </label>
                <textarea
                  value={currentAnswer?.textContent || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-fast resize-none text-base placeholder:text-neutral-400 shadow-sm hover:border-neutral-300 hover:shadow-md"
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
              className="w-full p-5 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-fast resize-none text-base placeholder:text-neutral-400 shadow-sm hover:border-neutral-300 hover:shadow-md"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3.5 bg-white text-neutral-700 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:bg-white transition-all duration-fast shadow-sm hover:shadow-md"
          >
            ← Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold shadow-md hover:shadow-lg transition-all duration-fast transform hover:-translate-y-0.5"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3.5 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 font-semibold disabled:from-neutral-400 disabled:to-neutral-500 shadow-md hover:shadow-lg transition-all duration-fast transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}