'use client';

import React, { useState, useRef } from 'react';
import { Target, Delete, RotateCcw, Check, Sparkles } from 'lucide-react';
import { AptitudeDifficulty, Target24Puzzle, AptitudeSession } from '@/lib/aptitude-games/types';
import { submitAptitudeAnswer } from '@/lib/aptitude-games/session-manager';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import GameTimer from './GameTimer';
import GameCompleteModal from './GameCompleteModal';

interface Target24GameProps {
  initialSession: AptitudeSession;
  initialPuzzle: Target24Puzzle;
  onRestart: () => void;
}

interface ExpressionToken {
  type: 'NUMBER' | 'OPERATOR' | 'PAREN';
  value: string;
  numberIndex?: number; // references index in puzzle.numbers
}

export default function Target24Game({
  initialSession,
  initialPuzzle,
  onRestart,
}: Target24GameProps) {
  const [session, setSession] = useState<AptitudeSession>(initialSession);
  const [puzzle, setPuzzle] = useState<Target24Puzzle>(initialPuzzle);
  const [tokens, setTokens] = useState<ExpressionToken[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeRemainingRef = useRef(initialSession.timeLimitSeconds);
  const [isComplete, setIsComplete] = useState(false);

  // Track which number indices are currently placed in tokens
  const usedNumberIndices = new Set(
    tokens.filter((t) => t.type === 'NUMBER').map((t) => t.numberIndex!)
  );

  const handleAddNumber = (num: number, index: number) => {
    if (usedNumberIndices.has(index) || isSubmitting || isComplete) return;
    aptitudeSound.playSnap();
    setTokens([...tokens, { type: 'NUMBER', value: String(num), numberIndex: index }]);
  };

  const handleAddOperator = (op: string) => {
    if (isSubmitting || isComplete) return;
    aptitudeSound.playKeyClick();
    setTokens([...tokens, { type: 'OPERATOR', value: op }]);
  };

  const handleAddParen = (p: '(' | ')') => {
    if (isSubmitting || isComplete) return;
    aptitudeSound.playKeyClick();
    setTokens([...tokens, { type: 'PAREN', value: p }]);
  };

  const handleBackspace = () => {
    if (tokens.length === 0 || isSubmitting) return;
    aptitudeSound.playKeyClick();
    setTokens(tokens.slice(0, -1));
  };

  const handleClear = () => {
    if (tokens.length === 0 || isSubmitting) return;
    aptitudeSound.playKeyClick();
    setTokens([]);
  };

  const expressionString = tokens.map((t) => t.value).join(' ');

  const handleSubmit = () => {
    if (tokens.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    const res = submitAptitudeAnswer(session, expressionString, timeRemainingRef.current);

    if (res.correct) {
      aptitudeSound.playCorrect();
      setFeedback({ correct: true, text: res.explanation || 'Target Achieved!' });

      setTimeout(() => {
        setFeedback(null);
        setTokens([]);
        setIsSubmitting(false);

        if (res.isGameComplete) {
          setIsComplete(true);
        } else if (res.nextPuzzle) {
          setPuzzle(res.nextPuzzle);
          setSession({ ...session, round: res.nextRound!, score: res.totalScore, streak: res.streak });
        }
      }, 800);
    } else {
      aptitudeSound.playWrong();
      setFeedback({ correct: false, text: res.explanation || 'Invalid Expression' });
      setTimeout(() => {
        setFeedback(null);
        setTokens([]);
        setIsSubmitting(false);

        if (res.isGameComplete) {
          setIsComplete(true);
        } else if (res.nextPuzzle) {
          setPuzzle(res.nextPuzzle);
          setSession({ ...session, round: res.nextRound!, score: res.totalScore, streak: 0 });
        }
      }, 1500);
    }
  };

  const handleTimeout = () => {
    if (isComplete) return;
    aptitudeSound.playWrong();
    setFeedback({ correct: false, text: "Time's up! Moving to next puzzle." });

    setTimeout(() => {
      setFeedback(null);
      setTokens([]);
      const res = submitAptitudeAnswer(session, '', 0);
      if (res.isGameComplete || session.round >= session.totalRounds) {
        setIsComplete(true);
      } else if (res.nextPuzzle) {
        setPuzzle(res.nextPuzzle);
        setSession({ ...session, round: res.nextRound!, streak: 0 });
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 select-none">
      {/* 1. TOP STATUS BAR: TARGET & TIMER */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider">
            Target: <strong className="text-sm text-white">24</strong>
          </span>
        </div>

        <GameTimer
          key={session.round}
          initialSeconds={session.timeLimitSeconds}
          isPaused={isSubmitting || isComplete}
          onExpire={handleTimeout}
          onTick={(rem) => {
            timeRemainingRef.current = rem;
          }}
          accentColor="#10b981"
        />
      </div>

      {/* 2. NUMBER TILES (THE 4 NUMBERS) */}
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl flex flex-col items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          USE EACH NUMBER EXACTLY ONCE
        </span>

        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
          {puzzle.numbers.map((num, idx) => {
            const isUsed = usedNumberIndices.has(idx);
            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed || isSubmitting}
                onClick={() => handleAddNumber(num, idx)}
                className={`h-16 sm:h-20 rounded-2xl font-display font-black text-2xl sm:text-3xl flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isUsed
                    ? 'bg-slate-950 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. EXPRESSION BUILDER CONSOLE */}
      <div className="w-full p-4 rounded-2xl bg-black/80 border border-slate-700/80 flex flex-col gap-3">
        <div className="min-h-[60px] p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-mono font-bold text-slate-100 flex-wrap">
            {tokens.length === 0 ? (
              <span className="text-slate-600 text-base font-normal">
                Click numbers and operators to build expression...
              </span>
            ) : (
              tokens.map((t, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded ${
                    t.type === 'NUMBER'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : t.type === 'OPERATOR'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t.value}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={handleBackspace}
              disabled={tokens.length === 0}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 disabled:opacity-30 cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={tokens.length === 0}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 disabled:opacity-30 cursor-pointer"
              title="Clear"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* OPERATORS TRAY */}
        <div className="grid grid-cols-6 gap-2">
          {['+', '-', '×', '÷', '(', ')'].map((op) => (
            <button
              key={op}
              type="button"
              disabled={isSubmitting}
              onClick={() => (op === '(' || op === ')' ? handleAddParen(op as any) : handleAddOperator(op))}
              className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 text-xl font-black text-amber-300 flex items-center justify-center transition-all cursor-pointer"
            >
              {op}
            </button>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          disabled={usedNumberIndices.size !== 4 || isSubmitting}
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-40 text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-1"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>SUBMIT = 24</span>
        </button>

        {feedback && (
          <div
            className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
              feedback.correct
                ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300'
                : 'bg-rose-950/90 border border-rose-500 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* VICTORY MODAL */}
      {isComplete && (
        <GameCompleteModal
          score={session.score}
          totalRounds={session.totalRounds}
          maxStreak={session.maxStreak}
          difficulty={session.difficulty}
          gameTitle="TARGET 24"
          onPlayAgain={onRestart}
          accentColor="#10b981"
        />
      )}
    </div>
  );
}
