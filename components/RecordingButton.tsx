'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface RecordingButtonProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  disabled?: boolean;
}

export function RecordingButton({
  onRecordingComplete,
  onRecordingStart,
  disabled,
}: RecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, finalDuration);
        chunksRef.current = [];
        setDuration(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();

      setIsRecording(true);
      onRecordingStart?.();

      intervalRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      toast.error('Microphone access denied. Check your browser settings.');
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? handleStop : handleStart}
      disabled={disabled}
      className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-semibold transition-all duration-fast ${
        isRecording
          ? 'bg-gradient-to-br from-danger-500 to-danger-600 shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-2 focus:ring-danger-500 focus:ring-offset-2'
          : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg hover:shadow-xl hover:scale-105 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      } ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''} relative overflow-hidden`}
    >
      <div className="text-4xl mb-2 relative z-10">🎤</div>
      <div className="text-base font-semibold relative z-10">
        {isRecording ? `${duration}s` : 'Record'}
      </div>
      {isRecording && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}
    </button>
  );
}