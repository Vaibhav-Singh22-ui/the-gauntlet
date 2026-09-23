'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ArrowLeft, Flame, Trophy } from 'lucide-react';
import { audio } from '@/lib/audio';
import { AptitudeDifficulty } from '@/lib/aptitude-games/types';

interface AptitudeHeaderProps {
  title: string;
  round?: number;
  totalRounds?: number;
  score?: number;
  streak?: number;
  difficulty?: AptitudeDifficulty;
  accentColor?: string;
  onExit?: () => void;
  backHref?: string;
}

export default function AptitudeHeader({
  title,
  round,
  totalRounds = 5,
  score = 0,
  streak = 0,
  difficulty,
  accentColor = '#f59e0b',
  onExit,
  backHref = '/aptitude',
}: AptitudeHeaderProps) {
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

  return (
    <header className="relative w-full px-4 sm:px-6 py-3 flex items-center justify-between z-30 select-none border-b border-slate-800/80 bg-black/50 backdrop-blur-md">
      {/* LEFT: BACK BUTTON & TITLE */}
      <div className="flex items-center gap-3">
        {onExit ? (
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        ) : (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hub</span>
          </Link>
        )}

        <div className="flex flex-col">
          <span
            className="text-lg sm:text-xl font-black font-display tracking-wide uppercase leading-tight"
            style={{ color: accentColor }}
          >
            {title}
          </span>
          <div className="flex items-center gap-2">
            {difficulty && (
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                  difficulty === 'EASY'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : difficulty === 'MEDIUM'
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                }`}
              >
                {difficulty}
              </span>
            )}
            {round !== undefined && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Round {round} of {totalRounds}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: SCORE & STREAK (if gameplay active) */}
      {round !== undefined && (
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Score Badge */}
          <div className="flex items-center gap-2 px-3 sm:px-5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-300/80">
                Score
              </span>
              <span className="text-base sm:text-xl font-black font-display text-amber-300 leading-none">
                {score}
              </span>
            </div>
          </div>

          {/* Streak Indicator */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-950/60 border border-orange-500/50 text-orange-400 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span className="text-xs font-black tracking-wider">{streak}x</span>
            </div>
          )}
        </div>
      )}

      {/* RIGHT: SOUND TOGGLE & MAIN ARENA LINK */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleSound}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md ${
            muted
              ? 'bg-black/60 border-red-500/60 text-red-400 hover:bg-red-950/40'
              : 'bg-black/60 border-amber-500/60 text-amber-300 hover:bg-amber-950/40'
          }`}
          title={muted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label="Toggle Sound"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/50 text-amber-300 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <span>50 Millionaire Arena</span>
        </Link>
      </div>
    </header>
  );
}
