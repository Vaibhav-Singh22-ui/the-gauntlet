'use client';

import React, { useState, useRef } from 'react';
import { Puzzle, Check, Sparkles } from 'lucide-react';
import { AptitudeDifficulty, MissingPiecePuzzle, AptitudeSession } from '@/lib/aptitude-games/types';
import { submitAptitudeAnswer } from '@/lib/aptitude-games/session-manager';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import VisualPieceSvg from './VisualPieceSvg';
import GameTimer from './GameTimer';
import GameCompleteModal from './GameCompleteModal';

interface MissingPieceGameProps {
  initialSession: AptitudeSession;
  initialPuzzle: MissingPiecePuzzle;
  onRestart: () => void;
}

export default function MissingPieceGame({
  initialSession,
  initialPuzzle,
  onRestart,
}: MissingPieceGameProps) {
  const [session, setSession] = useState<AptitudeSession>(initialSession);
  const [puzzle, setPuzzle] = useState<MissingPiecePuzzle>(initialPuzzle);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeRemainingRef = useRef(initialSession.timeLimitSeconds);
  const [isComplete, setIsComplete] = useState(false);

  const handleSelectCandidate = (idx: number) => {
    if (isSubmitting || isComplete) return;
    aptitudeSound.playSnap();
    setSelectedIndex(idx);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || isSubmitting) return;
    setIsSubmitting(true);

    const res = submitAptitudeAnswer(session, selectedIndex, timeRemainingRef.current);

    if (res.correct) {
      aptitudeSound.playCorrect();
      setFeedback({ correct: true, text: res.explanation || 'Pattern complete!' });

      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
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
      setFeedback({ correct: false, text: res.explanation || 'Incorrect piece.' });
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
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
    setFeedback({ correct: false, text: "Time's up! Moving to next visual puzzle." });

    setTimeout(() => {
      setFeedback(null);
      setSelectedIndex(null);
      const res = submitAptitudeAnswer(session, -1, 0);
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
          <Puzzle className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-black tracking-widest text-pink-400 uppercase">
            Visual Reasoning Matrix
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
          accentColor="#ec4899"
        />
      </div>

      {/* 2. 3x3 VISUAL MATRIX */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-pink-500/30 shadow-2xl flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          ANALYZE TRANSFORMATION RULES ACROSS ROWS & COLUMNS
        </span>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-black/80 rounded-2xl border border-slate-800">
          {puzzle.matrix.map((row, rIdx) =>
            row.map((cellConfig, cIdx) => {
              const isMissingSlot = rIdx === 2 && cIdx === 2;

              if (isMissingSlot) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 flex items-center justify-center transition-all ${
                      selectedIndex !== null
                        ? 'bg-pink-950/40 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                        : 'border-dashed border-pink-500/60 bg-slate-950/60 animate-pulse'
                    }`}
                  >
                    {selectedIndex !== null ? (
                      <VisualPieceSvg config={puzzle.candidates[selectedIndex]} size={60} />
                    ) : (
                      <span className="text-2xl font-black text-pink-400 font-display">?</span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-md p-2"
                >
                  {cellConfig && <VisualPieceSvg config={cellConfig} size={60} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CANDIDATE PIECES TRAY */}
      <div className="w-full max-w-xl flex flex-col items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          CHOOSE THE FITTING PIECE
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {puzzle.candidates.map((cand, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSelectCandidate(idx)}
                className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isSelected
                    ? 'bg-pink-950/80 border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)] scale-105'
                    : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <VisualPieceSvg config={cand} size={50} />
                <span className="text-[9px] font-bold text-slate-400 mt-1">#{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          disabled={selectedIndex === null || isSubmitting}
          onClick={handleSubmit}
          className="w-full max-w-xs h-12 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] disabled:opacity-40 text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer mt-2"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM PIECE</span>
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
          gameTitle="MISSING PIECE"
          onPlayAgain={onRestart}
          accentColor="#ec4899"
        />
      )}
    </div>
  );
}
