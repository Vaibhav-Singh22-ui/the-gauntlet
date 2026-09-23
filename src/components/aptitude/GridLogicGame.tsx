'use client';

import React, { useState, useRef } from 'react';
import { Grid as GridIcon, Check } from 'lucide-react';
import { AptitudeDifficulty, GridLogicPuzzle, AptitudeSession } from '@/lib/aptitude-games/types';
import { submitAptitudeAnswer } from '@/lib/aptitude-games/session-manager';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import NumberPad from './NumberPad';
import GameTimer from './GameTimer';
import GameCompleteModal from './GameCompleteModal';

interface GridLogicGameProps {
  initialSession: AptitudeSession;
  initialPuzzle: GridLogicPuzzle;
  onRestart: () => void;
}

export default function GridLogicGame({
  initialSession,
  initialPuzzle,
  onRestart,
}: GridLogicGameProps) {
  const [session, setSession] = useState<AptitudeSession>(initialSession);
  const [puzzle, setPuzzle] = useState<GridLogicPuzzle>(initialPuzzle);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeRemainingRef = useRef(initialSession.timeLimitSeconds);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const res = submitAptitudeAnswer(session, inputValue, timeRemainingRef.current);

    if (res.correct) {
      aptitudeSound.playCorrect();
      setFeedback({ correct: true, text: res.explanation || 'Correct!' });

      setTimeout(() => {
        setFeedback(null);
        setInputValue('');
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
      setFeedback({ correct: false, text: res.explanation || 'Incorrect deduction.' });
      setTimeout(() => {
        setFeedback(null);
        setInputValue('');
        setIsSubmitting(false);

        if (res.isGameComplete) {
          setIsComplete(true);
        } else if (res.nextPuzzle) {
          setPuzzle(res.nextPuzzle);
          setSession({ ...session, round: res.nextRound!, score: res.totalScore, streak: 0 });
        }
      }, 1400);
    }
  };

  const handleTimeout = () => {
    if (isComplete) return;
    aptitudeSound.playWrong();
    setFeedback({ correct: false, text: "Time's up! Moving to next grid." });

    setTimeout(() => {
      setFeedback(null);
      setInputValue('');
      const res = submitAptitudeAnswer(session, '0', 0);
      if (res.isGameComplete || session.round >= session.totalRounds) {
        setIsComplete(true);
      } else if (res.nextPuzzle) {
        setPuzzle(res.nextPuzzle);
        setSession({ ...session, round: res.nextRound!, streak: 0 });
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 select-none">
      {/* 1. TOP BAR */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <GridIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            3×3 Numerical Matrix
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
          accentColor="#f59e0b"
        />
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
        {/* 2. 3x3 MATRIX DISPLAY */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-2xl flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            DEDUCE ROW & COLUMN INVARIANTS
          </span>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3 bg-black/60 rounded-2xl border border-slate-800">
            {puzzle.grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isTarget = rIdx === puzzle.targetRow && cIdx === puzzle.targetCol;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-18 h-18 sm:w-22 sm:h-22 rounded-xl flex items-center justify-center transition-all ${
                      isTarget
                        ? 'bg-amber-950/70 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                        : 'bg-slate-800/90 border border-slate-700/80 shadow-md'
                    }`}
                  >
                    {isTarget ? (
                      <span className="text-2xl sm:text-3xl font-black font-display text-amber-300">
                        {inputValue || '?'}
                      </span>
                    ) : (
                      <span className="text-xl sm:text-2xl font-black font-display text-slate-200">
                        {cell}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {feedback && (
            <div
              className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold text-center transition-all max-w-xs ${
                feedback.correct
                  ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/90 border border-rose-500 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* 3. NUMBER PAD */}
        <NumberPad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={isSubmitting || isComplete}
        />
      </div>

      {/* VICTORY MODAL */}
      {isComplete && (
        <GameCompleteModal
          score={session.score}
          totalRounds={session.totalRounds}
          maxStreak={session.maxStreak}
          difficulty={session.difficulty}
          gameTitle="GRID LOGIC"
          onPlayAgain={onRestart}
          accentColor="#f59e0b"
        />
      )}
    </div>
  );
}
