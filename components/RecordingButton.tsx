'use client';

import { useRef, useState } from 'react';

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
      alert('Microphone access denied. Check your browser settings.');
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
      className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white font-medium transition ${
        isRecording
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="text-3xl mb-2">🎤</div>
      <div className="text-sm">
        {isRecording ? `${duration}s` : 'Record'}
      </div>
    </button>
  );
}