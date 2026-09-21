'use client';

import React, { useEffect } from 'react';
import { audio } from '@/lib/audio';
import { AlertTriangle, RotateCcw, Skull } from 'lucide-react';

interface GameOverModalProps {
  isTimeout: boolean;
  levelReached: number;
  correctOption: string;
  onResetGame: () => void;
}

export default function GameOverModal({
  isTimeout,
  levelReached,
  correctOption,
  onResetGame,
}: GameOverModalProps) {
  useEffect(() => {
    // Play user-provided lose sound
    audio.playLose();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#131014] border border-red-600/70 rounded-3xl p-7 text-center shadow-[0_0_60px_rgba(220,38,38,0.4)] relative">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center mb-4 text-red-400">
          {isTimeout ? <AlertTriangle className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        <h2 className="text-3xl font-black font-display tracking-tight text-red-500 uppercase danger-text-glow mb-1">
          {isTimeout ? "TIME'S UP!" : 'WRONG ANSWER!'}
        </h2>

        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-5">
          Game Over • Level {levelReached}
        </p>

        <div className="bg-[#1b1417] border border-red-900/60 rounded-2xl p-4 mb-6">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Correct Option Was
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-display">
            Option {correctOption}
          </div>
          <div className="mt-3 pt-3 border-t border-red-950 flex items-center justify-between text-xs">
            <span className="text-slate-400">Final Score:</span>
            <span className="text-base font-black text-red-400 font-display">0 PTS</span>
          </div>
        </div>

        <button
          onClick={onResetGame}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-700 via-rose-600 to-red-700 hover:from-red-600 hover:to-rose-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESET / NEXT PLAYER</span>
        </button>
      </div>
    </div>
  );
}
