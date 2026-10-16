'use client';

import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface RestTimerProps {
  lastCompletedAt?: string;
  onSetStarted?: () => void;
}

export function RestTimer({ lastCompletedAt }: RestTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!lastCompletedAt) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(lastCompletedAt).getTime();
      const diff = Math.max(0, Math.floor((now - end) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCompletedAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!lastCompletedAt) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-mono animate-pulse">
      <Timer className="w-4 h-4" />
      <span>Rest: {formatted}</span>
    </div>
  );
}
