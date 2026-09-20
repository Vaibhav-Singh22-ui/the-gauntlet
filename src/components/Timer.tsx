'use client';

import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  initialSeconds?: number;
  isActive: boolean;
  onTimeout: () => void;
  presentedAt?: string;
}

export default function Timer({
  initialSeconds = 60,
  isActive,
  onTimeout,
  presentedAt,
}: TimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Synchronize based on presentedAt if available to avoid clock drift
  useEffect(() => {
    if (!isActive) {
      setSecondsRemaining(initialSeconds);
      return;
    }

    if (presentedAt) {
      const elapsed = (Date.now() - new Date(presentedAt).getTime()) / 1000;
      const rem = Math.max(0, Math.ceil(initialSeconds - elapsed));
      setSecondsRemaining(rem);
    } else {
      setSecondsRemaining(initialSeconds);
    }
  }, [isActive, initialSeconds, presentedAt]);

  // Countdown interval
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onTimeoutRef.current?.();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsRemaining / initialSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  // Urgency states:
  // Normal: > 20s
  // Warning: 11 - 20s
  // Critical: <= 10s
  const isWarning = secondsRemaining <= 20 && secondsRemaining > 10;
  const isCritical = secondsRemaining <= 10;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Progress Gauge */}
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="#1e2436"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Counter Number */}
        <span
          className={`absolute text-base font-extrabold font-display transition-colors ${
            isCritical
              ? 'text-red-500 animate-pulse-urgent danger-text-glow'
              : isWarning
              ? 'text-amber-400'
              : 'text-slate-100'
          }`}
        >
          {secondsRemaining}
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          Time Remaining
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isCritical ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-slate-300'
          }`}
        >
          {isCritical ? 'CRITICAL' : isWarning ? 'HURRY' : '60 SEC'}
        </span>
      </div>
    </div>
  );
}
