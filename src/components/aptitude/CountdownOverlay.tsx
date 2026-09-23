'use client';

import React, { useEffect, useState } from 'react';
import { aptitudeSound } from '@/lib/aptitude-games/sound';

interface CountdownOverlayProps {
  onComplete: () => void;
  accentColor?: string;
}

export default function CountdownOverlay({
  onComplete,
  accentColor = '#f59e0b',
}: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    aptitudeSound.playTick(false);
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          aptitudeSound.playKeyClick();
          setTimeout(onComplete, 500);
          return 0; // "GO!"
        }
        aptitudeSound.playTick(false);
        return prev - 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none">
      <div className="flex flex-col items-center justify-center animate-bounce">
        <span
          className="text-7xl sm:text-9xl font-black font-cinzel tracking-wider drop-shadow-[0_0_40px_rgba(245,158,11,0.6)]"
          style={{ color: count === 0 ? '#10b981' : accentColor }}
        >
          {count > 0 ? count : 'GO!'}
        </span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-slate-400 mt-4">
          Prepare for Sprint
        </span>
      </div>
    </div>
  );
}
