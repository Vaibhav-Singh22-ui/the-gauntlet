'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Users, CheckCircle, Flame, X } from 'lucide-react';
import { REWARD_LADDER } from '@/types/game';

interface ArcadeConsoleProps {
  currentLevel: number;
  currentReward: number;
  isTimerActive: boolean;
  onTimeout: () => void;
  presentedAt?: string;
  hintAvailable: boolean;
  fiftyFiftyAvailable: boolean;
  onUseHint: () => Promise<string | null>;
  onUseFiftyFifty: () => Promise<void>;
  isRiskPhase: boolean;
  onRiskContinue: () => void;
  onCashOut?: () => void;
  disabled: boolean;
}

export default function ArcadeConsole({
  currentLevel,
  currentReward,
  isTimerActive,
  onTimeout,
  presentedAt,
  hintAvailable,
  fiftyFiftyAvailable,
  onUseHint,
  onUseFiftyFifty,
  isRiskPhase,
  onRiskContinue,
  onCashOut,
  disabled,
}: ArcadeConsoleProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [hintClue, setHintClue] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingFifty, setLoadingFifty] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingCashOut, setLoadingCashOut] = useState(false);

  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Synchronize timer with presentedAt
  useEffect(() => {
    if (!isTimerActive) {
      setSecondsRemaining(60);
      return;
    }

    if (presentedAt) {
      const elapsed = (Date.now() - new Date(presentedAt).getTime()) / 1000;
      setSecondsRemaining(Math.max(0, Math.ceil(60 - elapsed)));
    } else {
      setSecondsRemaining(60);
    }
  }, [isTimerActive, presentedAt]);

  // Timer countdown interval
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onTimeoutRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleHintClick = async () => {
    if (!hintAvailable || disabled || loadingHint) return;
    setLoadingHint(true);
    try {
      const clue = await onUseHint();
      if (clue) setHintClue(clue);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleFiftyClick = async () => {
    if (!fiftyFiftyAvailable || disabled || loadingFifty) return;
    setLoadingFifty(true);
    try {
      await onUseFiftyFifty();
    } finally {
      setLoadingFifty(false);
    }
  };

  const isWarning = secondsRemaining <= 20 && secondsRemaining > 10;
  const isCritical = secondsRemaining <= 10;

  // Circular gauge math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsRemaining / 60));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <aside className="w-full max-w-[340px] sm:max-w-[370px] console-frame rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 select-none relative z-20">
      {/* 1. TOP: LIFELINES (HINT & 50:50) */}
      <div className="grid grid-cols-2 gap-3">
        {/* HINT BUTTON */}
        <button
          onClick={handleHintClick}
          disabled={!hintAvailable || disabled || loadingHint}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-black tracking-wider uppercase transition-all shadow-md cursor-pointer ${
            hintAvailable && !disabled
              ? 'bg-[#151928] border-amber-500/60 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#0e1017] border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
          title="Use Hint Lifeline"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>HINT</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hintAvailable ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
            }`}
          />
        </button>

        {/* 50:50 BUTTON */}
        <button
          onClick={handleFiftyClick}
          disabled={!fiftyFiftyAvailable || disabled || loadingFifty}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-black tracking-wider uppercase transition-all shadow-md cursor-pointer ${
            fiftyFiftyAvailable && !disabled
              ? 'bg-[#151928] border-amber-500/60 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#0e1017] border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
          title="Use 50:50 Lifeline"
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>50 : 50</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              fiftyFiftyAvailable ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
            }`}
          />
        </button>
      </div>

      {/* 2. CENTER: GLOWING CIRCULAR COUNTDOWN TIMER */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative flex items-center justify-center">
          {/* Outer glow aura */}
          <div
            className={`absolute w-32 h-32 rounded-full filter blur-xl transition-all duration-500 ${
              isCritical
                ? 'bg-red-600/30'
                : isWarning
                ? 'bg-amber-500/20'
                : 'bg-amber-500/10'
            }`}
          />

          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#181c2b"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Active Countdown Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#fbbf24'}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            />
          </svg>

          {/* Center Digital Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-4xl sm:text-5xl font-black font-display tracking-tight transition-colors ${
                isCritical
                  ? 'text-red-500 animate-pulse danger-text-glow'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {secondsRemaining}
            </span>
            <span className="text-[9px] uppercase font-black tracking-[0.25em] text-slate-400 -mt-1">
              SECONDS
            </span>
          </div>
        </div>
      </div>

      {/* 3. LOWER SECTION: RISK STATUS / RISK DECISION */}
      <div className="bg-[#0e101a] border border-[#22273d] rounded-2xl p-4 flex flex-col items-center text-center shadow-inner relative overflow-hidden">
        {isRiskPhase ? (
          <div className="flex flex-col items-center w-full animate-fadeIn gap-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 text-red-500 animate-bounce" />
              <span>DECISION TIME</span>
            </div>
            <span className="text-[11px] text-slate-300">
              Secured: <strong className="text-amber-400 font-bold">₹{currentReward}</strong>. Risk for more or cash out now!
            </span>

            {/* BUTTON 1: RISK IT */}
            <button
              onClick={async () => {
                if (loadingRisk || loadingCashOut) return;
                setLoadingRisk(true);
                try {
                  await onRiskContinue();
                } finally {
                  setLoadingRisk(false);
                }
              }}
              disabled={loadingRisk || loadingCashOut}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:via-amber-400 hover:to-red-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              {loadingRisk ? 'ADVANCING...' : `🔥 RISK IT — LEVEL ${currentLevel + 1}`}
            </button>

            {/* BUTTON 2: TAKE & LEAVE */}
            <button
              onClick={async () => {
                if (loadingRisk || loadingCashOut || !onCashOut) return;
                setLoadingCashOut(true);
                try {
                  await onCashOut();
                } finally {
                  setLoadingCashOut(false);
                }
              }}
              disabled={loadingRisk || loadingCashOut}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              {loadingCashOut ? 'CASHING OUT...' : `💰 TAKE ₹${currentReward} & LEAVE`}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">RISK IT.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Your reward is</span>
            <div className="flex items-center gap-3 w-full justify-center my-1.5">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/60" />
              <span className="text-2xl font-black font-display text-amber-300 gold-metallic-text">
                ₹{currentReward}
              </span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
          </>
        )}
      </div>

      {/* 4. BOTTOM: 1 TO 15 LEVEL PROGRESSION TRACKER */}
      <div className="flex flex-col items-center pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 mb-2 px-1 font-display">
          <span>1</span>
          <span className="text-amber-400 text-[9px] uppercase tracking-widest">
            {currentLevel === 15 ? 'FINAL ROUND' : `LEVEL ${currentLevel} OF 15`}
          </span>
          <span>15</span>
        </div>

        {/* 15 Dots Ribbon */}
        <div className="flex items-center justify-between w-full px-1">
          {REWARD_LADDER.map((item) => {
            const isPassed = item.level < currentLevel;
            const isCurrent = item.level === currentLevel;

            return (
              <div
                key={item.level}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] scale-125'
                    : isPassed
                    ? 'bg-amber-500/80'
                    : 'bg-[#1e2336] border border-slate-700'
                }`}
                title={`Level ${item.level}: ₹${item.reward}`}
              />
            );
          })}
        </div>

        {/* Connecting Progress Bar */}
        <div className="w-full bg-[#161a29] h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500"
            style={{ width: `${(currentLevel / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Hint Modal Popover */}
      {hintClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#121422] border border-amber-500/80 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setHintClue(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-display font-black text-base uppercase tracking-wider">
                Directional Clue
              </h3>
            </div>

            <p className="text-slate-200 text-sm leading-relaxed bg-[#181b2e] p-4 rounded-xl border border-slate-800">
              "{hintClue}"
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setHintClue(null)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
