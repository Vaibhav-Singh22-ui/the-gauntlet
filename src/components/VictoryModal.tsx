'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { audio } from '@/lib/audio';
import { Award, RotateCcw, Trophy } from 'lucide-react';

interface VictoryModalProps {
  onResetGame: () => void;
  reward?: number;
  isCashOut?: boolean;
  levelReached?: number;
}

export default function VictoryModal({
  onResetGame,
  reward = 150,
  isCashOut = false,
  levelReached = 15,
}: VictoryModalProps) {
  useEffect(() => {
    // Play user-provided win sound
    audio.playWin();

    // Trigger celebratory gold and emerald confetti
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8', '#ffffff'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 110,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
      }, 800);

      return () => clearTimeout(timer);
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1c180e] via-[#121422] to-[#0d0f1a] border-2 border-amber-400 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.5)] relative">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center mb-5 text-slate-950 shadow-xl shadow-amber-500/40 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-amber-300 uppercase gold-text-glow mb-1">
          {isCashOut ? 'POINTS BANKED & SECURED!' : '50 MILLIONAIRE CONQUERED!'}
        </h2>

        <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-6 flex items-center justify-center gap-1.5">
          <Award className="w-4 h-4" />
          {isCashOut
            ? `Banked at Level ${levelReached} • Tactical Exit with High Score`
            : 'All 15 Levels Conquered — 50 Millionaire Champion'}
        </p>

        <div className="bg-[#19160f] border border-amber-500/50 rounded-2xl p-6 mb-7 gold-glow-box">
          <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">
            {isCashOut ? 'Confirmed Final Score' : 'Grand Champion Score'}
          </div>
          <div className="text-5xl font-black text-amber-400 mt-2 font-display gold-text-glow">
            {reward} PTS
          </div>
          <p className="text-[11px] text-amber-200/80 mt-2">
            Your final score of {reward} PTS is recorded with the arena operator!
          </p>
        </div>

        <button
          onClick={onResetGame}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>START NEW CHALLENGE</span>
        </button>
      </div>
    </div>
  );
}
