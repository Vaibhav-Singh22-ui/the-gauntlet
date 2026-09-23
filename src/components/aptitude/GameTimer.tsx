'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Timer as TimerIcon } from 'lucide-react';
import { aptitudeSound } from '@/lib/aptitude-games/sound';

interface GameTimerProps {
  initialSeconds: number;
  isPaused?: boolean;
  onExpire: () => void;
  onTick?: (remaining: number) => void;
  accentColor?: string;
}

export default function GameTimer({
  initialSeconds,
  isPaused = false,
  onExpire,
  onTick,
  accentColor = '#f59e0b',
}: GameTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Reset when initialSeconds changes (new round)
  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onExpireRef.current?.();
          }, 0);
          return 0;
        }

        const next = prev - 1;
        if (next <= 5 && next > 0) {
          aptitudeSound.playTick(true);
        } else if (next > 5 && next % 5 === 0) {
          aptitudeSound.playTick(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Safely notify parent outside of render cycle
  useEffect(() => {
    onTickRef.current?.(remaining);
  }, [remaining]);

  const percentage = Math.max(0, (remaining / initialSeconds) * 100);
  const isUrgent = remaining <= 5;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
          isUrgent
            ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
        }`}
      >
        <TimerIcon
          className={`w-4 h-4 ${isUrgent ? 'text-rose-400 animate-spin' : 'text-slate-400'}`}
        />
        <span className="font-mono text-base sm:text-lg font-black tracking-wider">
          {String(remaining).padStart(2, '0')}s
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-28 sm:w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isUrgent ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
