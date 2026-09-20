'use client';

import React from 'react';
import { REWARD_LADDER } from '@/types/game';

interface RewardLadderProps {
  currentLevel: number;
  currentReward: number;
  isAtRisk: boolean;
  onRiskContinue?: () => void;
  disabled?: boolean;
}

export default function RewardLadder({
  currentLevel,
  currentReward,
  isAtRisk,
  onRiskContinue,
  disabled = false,
}: RewardLadderProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Risk Decision Bar (Active after a correct answer) */}
      {isAtRisk && (
        <div className="w-full max-w-xl mb-4 bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border border-amber-500/70 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 danger-glow-box animate-pulse-urgent">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-[10px] uppercase font-black tracking-widest text-red-400">
              High Stakes Decision
            </span>
            <span className="text-xl md:text-2xl font-black text-amber-300 font-display gold-text-glow">
              ₹{currentReward} AT RISK
            </span>
            <span className="text-[11px] text-slate-400">
              Next question wrong = ₹0. Clear Level {currentLevel + 1} for ₹{(currentLevel + 1) * 10}!
            </span>
          </div>

          <button
            onClick={onRiskContinue}
            disabled={disabled}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            🔥 RISK IT — NEXT LEVEL
          </button>
        </div>
      )}

      {/* Horizontal Level Progress Ribbon */}
      <div className="w-full max-w-4xl bg-[#10121b] border border-[#202538] rounded-xl p-2 flex items-center justify-between overflow-x-auto gap-1">
        {REWARD_LADDER.map((item) => {
          const isPassed = item.level < currentLevel;
          const isCurrent = item.level === currentLevel;
          const isFinal = item.level === 15;

          let badgeClass = 'bg-[#151824] text-slate-500 border-transparent';
          if (isPassed) {
            badgeClass = 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400 font-bold';
          } else if (isCurrent) {
            badgeClass = isFinal
              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-400/30'
              : 'bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold shadow-md';
          }

          return (
            <div
              key={item.level}
              className={`flex-1 min-w-[52px] py-1.5 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${badgeClass}`}
            >
              <span className="text-[9px] uppercase tracking-tighter opacity-80">
                L{item.level}
              </span>
              <span className="text-xs font-bold font-display">
                ₹{item.reward}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
