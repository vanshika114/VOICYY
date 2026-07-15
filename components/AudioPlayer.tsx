'use client';

import { useRef, useState } from 'react';

interface AudioPlayerProps {
  url: string;
  durationSeconds?: number;
}

export function AudioPlayer({ url, durationSeconds }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-fast focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="flex-1 space-y-2">
          <div
            onClick={handleProgressClick}
            className="w-full h-2 bg-neutral-200 rounded-full cursor-pointer hover:h-2.5 transition-all duration-fast"
          >
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-fast"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}