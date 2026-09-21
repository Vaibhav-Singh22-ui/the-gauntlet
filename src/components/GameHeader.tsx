'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Settings, Shield } from 'lucide-react';
import { audio } from '@/lib/audio';
import Link from 'next/link';

interface GameHeaderProps {
  currentReward: number;
  currentLevel: number;
  maxLevels?: number;
  onOpenSettings?: () => void;
}

export default function GameHeader({
  currentReward,
  currentLevel,
  maxLevels = 15,
  onOpenSettings,
}: GameHeaderProps) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(audio.getMuted());
    const unsub = audio.subscribe((m) => setMuted(m));
    return unsub;
  }, []);

  const toggleSound = () => {
    const next = audio.toggleMute();
    setMuted(next);
  };

  const formattedLevel = String(currentLevel).padStart(2, '0');
  const formattedMax = String(maxLevels).padStart(2, '0');

  return (
    <header className="relative w-full px-6 py-3 flex items-center justify-between z-30 select-none">
      {/* 1. LEFT: 50 MILLIONAIRE LUXURY EMBLEM BRAND */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex-shrink-0">
          <img
            src="/fifty_millionaire_logo.jpg"
            alt="50 Millionaire Logo"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-black font-cinzel gold-metallic-text tracking-wider leading-tight">
            50 MILLIONAIRE
          </span>
          <span className="text-[8px] sm:text-[9px] font-black tracking-[0.3em] uppercase text-amber-300/80 drop-shadow-sm -mt-0.5">
            HIGH STAKES ARENA
          </span>
        </div>
      </div>

      {/* 2. CENTER: BEVELED HEXAGONAL CURRENT REWARD BADGE */}
      <div className="relative flex flex-col items-center">
        <div className="relative px-8 sm:px-12 py-1.5 sm:py-2 rounded-xl gold-bevel-badge flex flex-col items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.8)] border border-amber-500/70">
          {/* Subtle Chamfer Accents */}
          <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-amber-300 rounded-tl-sm pointer-events-none" />
          <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-amber-300 rounded-tr-sm pointer-events-none" />
          <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-amber-300 rounded-bl-sm pointer-events-none" />
          <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-amber-300 rounded-br-sm pointer-events-none" />

          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-[0.25em] text-amber-300/80">
            CURRENT SCORE
          </span>

          <span className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-amber-300 gold-metallic-text leading-tight mt-0.5 tracking-tight transition-all duration-300">
            {currentReward} PTS
          </span>
        </div>
      </div>

      {/* 3. RIGHT: SOUND, OPERATOR, & LEVEL BADGE */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md ${
            muted
              ? 'bg-black/60 border-red-500/60 text-red-400 hover:bg-red-950/40'
              : 'bg-black/60 border-amber-500/60 text-amber-300 hover:bg-amber-950/40'
          }`}
          title={muted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label="Toggle Sound"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Operator Portal Link / Settings */}
        <Link
          href="/operator"
          className="w-9 h-9 rounded-full bg-black/60 border border-amber-500/60 flex items-center justify-center text-amber-300 hover:bg-amber-950/40 transition-all shadow-md cursor-pointer"
          title="Operator Dashboard"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Level Indicator Pill */}
        <div className="px-3.5 py-1.5 rounded-full bg-black/70 border border-amber-500/70 shadow-md flex items-center gap-1.5">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            LEVEL
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-display">
            {formattedLevel} <span className="text-slate-500 font-normal text-xs">/ {formattedMax}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
