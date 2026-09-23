'use client';

import React, { useState, useRef } from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { AptitudeDifficulty, NumberSprintPuzzle, AptitudeSession } from '@/lib/aptitude-games/types';
import { submitAptitudeAnswer } from '@/lib/aptitude-games/session-manager';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import NumberPad from './NumberPad';
import GameTimer from './GameTimer';
import GameCompleteModal from './GameCompleteModal';

interface NumberSprintGameProps {
  initialSession: AptitudeSession;
  initialPuzzle: NumberSprintPuzzle;
  onRestart: () => void;
}

export default function NumberSprintGame({
  initialSession,
  initialPuzzle,
  onRestart,
}: NumberSprintGameProps) {
  const [session, setSession] = useState<AptitudeSession>(initialSession);
  const [puzzle, setPuzzle] = useState<NumberSprintPuzzle>(initialPuzzle);
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
      }, 700);
    } else {
      aptitudeSound.playWrong();
      setFeedback({ correct: false, text: res.explanation || 'Incorrect!' });
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
    setFeedback({ correct: false, text: "Time's up! Moving to next round." });

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
      {/* 1. TOP STATUS BAR: TIMER */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
            {puzzle.patternName || 'Sequence Pattern'}
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
          accentColor="#3b82f6"
        />
      </div>

      {/* 2. THE SEQUENCE DISPLAY */}
      <div className="w-full p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-blue-500/30 shadow-2xl flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-4">
          {puzzle.sequence.map((num, idx) => {
            const isMissing = idx === puzzle.missingIndex;
            return (
              <React.Fragment key={idx}>
                {isMissing ? (
                  <div className="relative min-w-[70px] sm:min-w-[90px] h-14 sm:h-18 px-3 rounded-xl bg-blue-950/60 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse">
                    <span className="text-2xl sm:text-3xl font-black font-display text-blue-300">
                      {inputValue || '?'}
                    </span>
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded bg-blue-500 text-black text-[9px] font-black uppercase tracking-wider">
                      TARGET
                    </span>
                  </div>
                ) : (
                  <div className="min-w-[55px] sm:min-w-[75px] h-14 sm:h-18 px-3 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-md">
                    <span className="text-xl sm:text-2xl font-black font-display text-slate-200">
                      {num}
                    </span>
                  </div>
                )}

                {idx < puzzle.sequence.length - 1 && (
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div
            className={`mt-4 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
              feedback.correct
                ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300'
                : 'bg-rose-950/90 border border-rose-500 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* 3. TACTILE INPUT KEYPAD */}
      <NumberPad
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isSubmitting || isComplete}
      />

      {/* VICTORY / COMPLETE MODAL */}
      {isComplete && (
        <GameCompleteModal
          score={session.score}
          totalRounds={session.totalRounds}
          maxStreak={session.maxStreak}
          difficulty={session.difficulty}
          gameTitle="NUMBER SPRINT"
          onPlayAgain={onRestart}
          accentColor="#3b82f6"
        />
      )}
    </div>
  );
}
