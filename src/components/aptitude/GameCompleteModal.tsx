'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, LayoutGrid, Flame } from 'lucide-react';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import { AptitudeDifficulty } from '@/lib/aptitude-games/types';

interface GameCompleteModalProps {
  score: number;
  totalRounds: number;
  maxStreak: number;
  difficulty: AptitudeDifficulty;
  gameTitle: string;
  onPlayAgain: () => void;
  accentColor?: string;
}

export default function GameCompleteModal({
  score,
  totalRounds,
  maxStreak,
  difficulty,
  gameTitle,
  onPlayAgain,
  accentColor = '#f59e0b',
}: GameCompleteModalProps) {
  useEffect(() => {
    aptitudeSound.playVictory();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#10b981', '#ec4899'],
      });
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-black border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center text-center">
        {/* Top Trophy Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] -mt-14 sm:-mt-16 mb-4">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-bounce" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300/80 mb-1">
          CHALLENGE COMPLETED
        </span>
        <h2
          className="text-2xl sm:text-3xl font-black font-cinzel tracking-wider uppercase mb-4"
          style={{ color: accentColor }}
        >
          {gameTitle}
        </h2>

        {/* Score Display */}
        <div className="w-full py-4 px-6 rounded-xl bg-slate-950/80 border border-amber-500/40 shadow-inner flex flex-col items-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Final Score
          </span>
          <span className="text-4xl sm:text-5xl font-black font-display text-amber-300 gold-metallic-text leading-tight mt-1">
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider mt-1">
            DIFFICULTY: {difficulty}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Rounds</span>
            <span className="text-lg font-black text-slate-100 mt-0.5">
              {totalRounds} / {totalRounds}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Max Streak</span>
            </div>
            <span className="text-lg font-black text-orange-400 mt-0.5">
              {maxStreak}x
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <Link
            href="/aptitude"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Arcade Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
