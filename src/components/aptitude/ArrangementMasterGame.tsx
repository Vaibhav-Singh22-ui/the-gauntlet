'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layers, CheckCircle2, XCircle, ArrowLeftRight, Check, Shield } from 'lucide-react';
import { AptitudeDifficulty, ArrangementPuzzle, AptitudeSession } from '@/lib/aptitude-games/types';
import { submitAptitudeAnswer } from '@/lib/aptitude-games/session-manager';
import { evaluateAllConstraints } from '@/lib/aptitude-games/arrangement-master/validator';
import { aptitudeSound } from '@/lib/aptitude-games/sound';
import GameTimer from './GameTimer';
import GameCompleteModal from './GameCompleteModal';

interface ArrangementMasterGameProps {
  initialSession: AptitudeSession;
  initialPuzzle: ArrangementPuzzle;
  onRestart: () => void;
}

export default function ArrangementMasterGame({
  initialSession,
  initialPuzzle,
  onRestart,
}: ArrangementMasterGameProps) {
  const [session, setSession] = useState<AptitudeSession>(initialSession);
  const [puzzle, setPuzzle] = useState<ArrangementPuzzle>(initialPuzzle);
  const [currentSlots, setCurrentSlots] = useState<string[]>(() => initialPuzzle.entities.map((e) => e.id));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeRemainingRef = useRef(initialSession.timeLimitSeconds);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize slots with entities in random order initially
  useEffect(() => {
    if (puzzle && puzzle.entities) {
      setCurrentSlots(puzzle.entities.map((e) => e.id));
      setSelectedSlotIndex(null);
    }
  }, [puzzle]);

  // Evaluate live constraints
  const liveConstraints = evaluateAllConstraints(puzzle, currentSlots);
  const allConstraintsSatisfied = liveConstraints.every((c) => c.status === 'SATISFIED');

  const handleSlotClick = (index: number) => {
    if (isSubmitting || isComplete) return;

    if (selectedSlotIndex === null) {
      aptitudeSound.playKeyClick();
      setSelectedSlotIndex(index);
    } else if (selectedSlotIndex === index) {
      // Deselect
      setSelectedSlotIndex(null);
    } else {
      // Swap slots
      aptitudeSound.playSnap();
      const newSlots = [...currentSlots];
      [newSlots[selectedSlotIndex], newSlots[index]] = [newSlots[index], newSlots[selectedSlotIndex]];
      setCurrentSlots(newSlots);
      setSelectedSlotIndex(null);
    }
  };

  const handleShift = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitting || isComplete) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSlots.length) return;

    aptitudeSound.playSnap();
    const newSlots = [...currentSlots];
    [newSlots[index], newSlots[targetIndex]] = [newSlots[targetIndex], newSlots[index]];
    setCurrentSlots(newSlots);
  };

  const handleSubmit = () => {
    if (isSubmitting || isComplete) return;
    setIsSubmitting(true);

    const res = submitAptitudeAnswer(session, currentSlots, timeRemainingRef.current);

    if (res.correct) {
      aptitudeSound.playCorrect();
      setFeedback({ correct: true, text: res.explanation || 'All constraints satisfied!' });

      setTimeout(() => {
        setFeedback(null);
        setIsSubmitting(false);

        if (res.isGameComplete) {
          setIsComplete(true);
        } else if (res.nextPuzzle) {
          setPuzzle(res.nextPuzzle);
          setCurrentSlots(res.nextPuzzle.entities.map((e: any) => e.id));
          setSelectedSlotIndex(null);
          setSession({ ...session, round: res.nextRound!, score: res.totalScore, streak: res.streak });
        }
      }, 800);
    } else {
      aptitudeSound.playWrong();
      setFeedback({ correct: false, text: res.explanation || 'Constraints are violated.' });
      setTimeout(() => {
        setFeedback(null);
        setSelectedSlotIndex(null);
        setIsSubmitting(false);

        if (res.isGameComplete) {
          setIsComplete(true);
        } else if (res.nextPuzzle) {
          setPuzzle(res.nextPuzzle);
          setCurrentSlots(res.nextPuzzle.entities.map((e: any) => e.id));
          setSession({ ...session, round: res.nextRound!, score: res.totalScore, streak: 0 });
        }
      }, 1500);
    }
  };

  const handleTimeout = () => {
    if (isComplete) return;
    aptitudeSound.playWrong();
    setFeedback({ correct: false, text: "Time's up! Moving to next arrangement puzzle." });

    setTimeout(() => {
      setFeedback(null);
      setSelectedSlotIndex(null);
      const res = submitAptitudeAnswer(session, [], 0);
      if (res.isGameComplete || session.round >= session.totalRounds) {
        setIsComplete(true);
      } else if (res.nextPuzzle) {
        setPuzzle(res.nextPuzzle);
        setCurrentSlots(res.nextPuzzle.entities.map((e: any) => e.id));
        setSession({ ...session, round: res.nextRound!, streak: 0 });
      }
    }, 1200);
  };

  const entityMap = new Map(puzzle.entities.map((e) => [e.id, e]));

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 select-none">
      {/* 1. TOP BAR */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-black tracking-widest text-violet-400 uppercase">
            Logical Arrangement Arena
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
          accentColor="#8b5cf6"
        />
      </div>

      {/* 2. INTERACTIVE SLOTS RACK */}
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-violet-500/30 shadow-2xl flex flex-col items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          CLICK TWO SLOTS TO SWAP POSITIONS (OR USE ARROWS)
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
          {currentSlots.map((id, idx) => {
            const entity = entityMap.get(id)!;
            const isSelected = selectedSlotIndex === idx;

            return (
              <div
                key={id}
                onClick={() => handleSlotClick(idx)}
                className={`relative group w-24 sm:w-28 h-28 sm:h-32 rounded-2xl p-2 flex flex-col items-center justify-between transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isSelected
                    ? 'bg-violet-950/90 border-2 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-105 ring-2 ring-violet-400'
                    : 'bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                {/* Slot Number Badge */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{idx + 1}
                  </span>
                  {isSelected && (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-violet-500 text-black animate-pulse">
                      SWAP
                    </span>
                  )}
                </div>

                {/* Entity Token Avatar */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shadow-md my-1"
                  style={{
                    backgroundColor: `${entity.color}25`,
                    borderColor: entity.color,
                    color: entity.color,
                  }}
                >
                  <Shield className="w-5 h-5 fill-current opacity-80" />
                </div>

                <span
                  className="text-xs sm:text-sm font-black uppercase tracking-wider text-center"
                  style={{ color: entity.color }}
                >
                  {entity.label}
                </span>

                {/* Quick Shift Arrows */}
                <div className="flex items-center gap-1 w-full justify-between opacity-70 group-hover:opacity-100 transition-opacity pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => handleShift(idx, 'left', e)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white px-1 disabled:opacity-20 cursor-pointer"
                  >
                    ◀
                  </button>
                  <ArrowLeftRight className="w-3 h-3 text-slate-600" />
                  <button
                    type="button"
                    disabled={idx === currentSlots.length - 1}
                    onClick={(e) => handleShift(idx, 'right', e)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white px-1 disabled:opacity-20 cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LIVE CONSTRAINT CHECKLIST */}
      <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-black/80 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            LOGICAL CONSTRAINTS (LIVE VERIFICATION)
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
              allConstraintsSatisfied
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            {liveConstraints.filter((c) => c.status === 'SATISFIED').length} /{' '}
            {liveConstraints.length} SATISFIED
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {liveConstraints.map((c) => (
            <div
              key={c.constraintId}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                c.status === 'SATISFIED'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 pr-2">
                {c.status === 'SATISFIED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{c.description}</span>
              </div>

              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
                  c.status === 'SATISFIED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          disabled={!allConstraintsSatisfied || isSubmitting}
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 active:scale-[0.98] disabled:opacity-40 text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all cursor-pointer mt-2"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM ARRANGEMENT</span>
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
          gameTitle="ARRANGEMENT MASTER"
          onPlayAgain={onRestart}
          accentColor="#8b5cf6"
        />
      )}
    </div>
  );
}
