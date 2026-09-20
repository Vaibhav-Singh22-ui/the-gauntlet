'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameSession,
  ActiveQuestionData,
  AnswerOption,
  WheelColor,
} from '@/types/game';
import {
  startGame,
  spinWheelAndGetQuestion,
  submitAnswer,
  useHint,
  useFiftyFifty,
  riskContinue,
  cashOut,
  resetGame,
} from '@/lib/game-engine';
import { audio } from '@/lib/audio';

import StageEnvironment from '@/components/StageEnvironment';
import GameHeader from '@/components/GameHeader';
import Wheel from '@/components/Wheel';
import QuestionCard from '@/components/QuestionCard';
import ArcadeConsole from '@/components/ArcadeConsole';
import GameOverModal from '@/components/GameOverModal';
import VictoryModal from '@/components/VictoryModal';
import { Play, Flame, ArrowRight, ShieldAlert, Banknote } from 'lucide-react';

export default function GameKioskPage() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestionData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedColorForWheel, setSelectedColorForWheel] = useState<WheelColor | null>(null);
  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [revealedCorrectOption, setRevealedCorrectOption] = useState<AnswerOption | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [gameOverIsTimeout, setGameOverIsTimeout] = useState(false);
  const [correctOptionForModal, setCorrectOptionForModal] = useState('A');
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isCashOutModal, setIsCashOutModal] = useState(false);
  const [cashOutReward, setCashOutReward] = useState(0);
  const [cashOutLevel, setCashOutLevel] = useState(1);

  // Initialize audio assets
  useEffect(() => {
    audio.init();
  }, []);

  // 1. Start Challenge
  const handleStartGame = async () => {
    setIsStartingGame(true);
    audio.stopAll();
    try {
      audio.startBGM();
      const res = await startGame();
      if (res.success && res.session) {
        setSession(res.session);
        setActiveQuestion(null);
        setSelectedColorForWheel(null);
        setIsSpinning(false);
        setSelectedOption(null);
        setRevealedCorrectOption(null);
        setIsGameOverModalOpen(false);
        setIsVictoryModalOpen(false);
        setIsCashOutModal(false);
      } else {
        alert(res.error || 'Failed to start game');
      }
    } finally {
      setIsStartingGame(false);
    }
  };

  // 2. Spin Wheel (Server Authoritative)
  const handleSpinStart = async () => {
    if (!session || isSpinning) return;
    setIsSpinning(true);
    setSelectedColorForWheel(null);

    const res = await spinWheelAndGetQuestion(session.id);
    if (res.success && res.question) {
      setActiveQuestion(res.question);
      // Trigger physical wheel animation to land on server selected color
      setSelectedColorForWheel(res.question.selected_color);
    } else {
      setIsSpinning(false);
      alert(res.error || 'Failed to select question');
    }
  };

  // 3. Wheel Spin Complete Callback
  const handleWheelLanded = useCallback((color: WheelColor) => {
    setIsSpinning(false);
    if (session) {
      setSession((prev) => (prev ? { ...prev, status: 'QUESTION_ACTIVE' } : null));
    }
  }, [session]);

  // 4. Submit Answer
  const handleSelectOption = async (option: AnswerOption) => {
    if (!session || !activeQuestion || isEvaluating || selectedOption !== null) return;

    setSelectedOption(option);
    setIsEvaluating(true);

    // 600ms suspense pause
    await new Promise((r) => setTimeout(r, 600));

    const res = await submitAnswer(session.id, activeQuestion.session_question_id, option);
    setIsEvaluating(false);

    if (res.success) {
      setRevealedCorrectOption(res.correct_option);

      if (res.correct) {
        if (session.current_level === 15) {
          // LEVEL 15 GRAND CHAMPION VICTORY
          setTimeout(() => {
            setSelectedOption(null);
            setRevealedCorrectOption(null);
            setIsVictoryModalOpen(true);
            setSession((prev) =>
              prev ? { ...prev, status: 'COMPLETED', current_reward: 150 } : null
            );
          }, 1000);
        } else {
          // Progress to RISK DECISION
          setTimeout(() => {
            setSelectedOption(null);
            setRevealedCorrectOption(null);
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'RISK_DECISION',
                    current_reward: res.current_reward,
                  }
                : null
            );
          }, 1200);
        }
      } else {
        // WRONG ANSWER -> GAME OVER
        setTimeout(() => {
          setCorrectOptionForModal(res.correct_option);
          setGameOverIsTimeout(false);
          setIsGameOverModalOpen(true);
          setSession((prev) =>
            prev ? { ...prev, status: 'GAME_OVER', current_reward: 0 } : null
          );
        }, 1200);
      }
    } else {
      alert(res.error || 'Error validating answer');
    }
  };

  // 5. Question Timeout Handler
  const handleTimeout = useCallback(async () => {
    if (!session || !activeQuestion || isEvaluating || selectedOption !== null) return;

    setIsEvaluating(true);
    const res = await submitAnswer(session.id, activeQuestion.session_question_id, 'TIMEOUT');
    setIsEvaluating(false);

    setCorrectOptionForModal(res.correct_option || 'A');
    setGameOverIsTimeout(true);
    setIsGameOverModalOpen(true);
    setSession((prev) =>
      prev ? { ...prev, status: 'GAME_OVER', current_reward: 0 } : null
    );
  }, [session, activeQuestion, isEvaluating, selectedOption]);

  // 6. Lifeline: Hint
  const handleUseHint = async (): Promise<string | null> => {
    if (!session || !activeQuestion) return null;
    const res = await useHint(session.id, activeQuestion.session_question_id);
    if (res.success && res.hintText) {
      setSession((prev) =>
        prev ? { ...prev, lifeline_hint_available: false } : null
      );
      return res.hintText;
    }
    return null;
  };

  // 7. Lifeline: 50:50
  const handleUseFiftyFifty = async () => {
    if (!session || !activeQuestion) return;
    const res = await useFiftyFifty(session.id, activeQuestion.session_question_id);
    if (res.success && res.removedOptions) {
      setActiveQuestion((prev) =>
        prev ? { ...prev, removed_options: res.removedOptions } : null
      );
      setSession((prev) =>
        prev ? { ...prev, lifeline_fifty_fifty_available: false } : null
      );
    }
  };

  // 8. Risk Continue to Next Level
  const handleRiskContinue = async () => {
    if (!session || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await riskContinue(session.id);
      if (res.success && res.newLevel) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                current_level: res.newLevel!,
                status: 'LEVEL_INTRO',
              }
            : null
        );
        setActiveQuestion(null);
        setSelectedColorForWheel(null);
        setSelectedOption(null);
        setRevealedCorrectOption(null);
      } else {
        alert(res.error || 'Failed to advance to next level');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // 9. Cash Out & Walk Away With Earnings
  const handleCashOut = async () => {
    if (!session || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await cashOut(session.id);
      if (res.success && res.finalReward !== undefined) {
        setCashOutReward(res.finalReward);
        setCashOutLevel(res.finalLevel || session.current_level);
        setIsCashOutModal(true);
        setIsVictoryModalOpen(true);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: 'COMPLETED',
                current_reward: res.finalReward!,
              }
            : null
        );
      } else {
        alert(res.error || 'Failed to cash out');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // 10. Reset for Next Player
  const handleReset = async () => {
    audio.stopAll();
    setIsCashOutModal(false);
    const res = await resetGame();
    if (res.success && res.session) {
      audio.startBGM();
      setSession(res.session);
      setActiveQuestion(null);
      setSelectedColorForWheel(null);
      setIsSpinning(false);
      setSelectedOption(null);
      setRevealedCorrectOption(null);
      setIsGameOverModalOpen(false);
      setIsVictoryModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: WELCOME / IDLE CINEMATIC SCREEN
  // -------------------------------------------------------------
  if (!session) {
    return (
      <main className="relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none">
        <StageEnvironment />
        <GameHeader currentReward={0} currentLevel={1} />

        {/* Center Stage Presentation */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
          {/* Tournament Logo Emblem */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.5)] mb-3">
            <img
              src="/the_gauntlet_logo.jpg"
              alt="The Gauntlet Logo"
              className="w-full h-full object-cover scale-105"
            />
          </div>

          <div className="px-5 py-1 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-300 text-[11px] font-black tracking-[0.25em] uppercase mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            High Stakes Arena
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-cinzel gold-metallic-text tracking-tight uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            THE GAUNTLET
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/70 font-semibold tracking-wider max-w-lg mt-1 uppercase font-display">
            15 Rapid Wheel Rounds • Risk For Higher Stakes • Or Cash Out & Walk Away
          </p>

          <div className="mt-6 flex items-center gap-6 sm:gap-8 p-4 sm:p-5 rounded-2xl console-frame border border-amber-500/30">
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400">
                ARENA
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                15 ROUNDS
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-amber-400">
                MAX PAYOUT
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-display gold-metallic-text mt-0.5">
                ₹150
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-sky-400">
                ROUND CLOCK
              </span>
              <span className="text-xl sm:text-2xl font-black text-sky-300 font-display mt-0.5">
                60 SEC
              </span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={isStartingGame}
            className="mt-7 px-10 sm:px-14 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-black text-sm sm:text-base tracking-[0.2em] uppercase shadow-[0_0_45px_rgba(245,158,11,0.5)] transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{isStartingGame ? 'INITIALIZING ARENA...' : 'ENTER THE GAUNTLET'}</span>
          </button>
        </div>

        {/* Bottom subtle credit */}
        <footer className="relative z-10 px-8 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <span>Stall Arcade Station</span>
          <span>Physical Stage Mechanics</span>
        </footer>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ACTIVE WIDESCREEN CINEMATIC GAME STAGE
  // -------------------------------------------------------------
  const isQuestionPhase = session.status === 'QUESTION_ACTIVE' && activeQuestion !== null;
  const isRiskPhase = session.status === 'RISK_DECISION';

  return (
    <main className="relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none">
      {/* 1. CINEMATIC STUDIO BACKGROUND */}
      <StageEnvironment />

      {/* 2. TOP BAR */}
      <GameHeader
        currentReward={session.current_reward}
        currentLevel={session.current_level}
        maxLevels={15}
      />

      {/* 3. MAIN WIDESCREEN STAGE (TWO COMPONENT LAYOUT) */}
      <div className="relative w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-10 z-10 gap-6 my-auto">
        {/* LEFT / CENTER STAGE (RISK DECISION, QUESTION CONSOLE, OR WHEEL) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {isRiskPhase ? (
            <div className="flex flex-col items-center justify-center w-full max-w-xl p-6 sm:p-8 rounded-3xl console-frame border-2 border-amber-500/70 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center animate-fadeIn">
              <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                ★ LEVEL {session.current_level} CONQUERED ★
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-white drop-shadow-md mb-2">
                SECURED REWARD:{' '}
                <span className="gold-metallic-text font-display">₹{session.current_reward}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
                You have <span className="text-emerald-400 font-bold">₹{session.current_reward}</span> in the bag.
                You can take the money and leave now, or risk it all to push for <span className="text-amber-300 font-bold">Level {session.current_level + 1} (target ₹{(session.current_level + 1) * 10})</span>!
              </p>

              {/* TWO CHOICES: RISK OR LEAVE */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full">
                {/* BUTTON 1: RISK & ADVANCE */}
                <button
                  onClick={handleRiskContinue}
                  disabled={isEvaluating}
                  className="flex-1 w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:via-amber-400 hover:to-red-500 text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Flame className="w-5 h-5 text-yellow-200 animate-bounce" />
                  <span>{isEvaluating ? 'PROCESSING...' : `RISK IT — LVL ${session.current_level + 1}`}</span>
                  <ArrowRight className="w-4 h-4 text-yellow-200" />
                </button>

                {/* BUTTON 2: TAKE & LEAVE */}
                <button
                  onClick={handleCashOut}
                  disabled={isEvaluating}
                  className="flex-1 w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Banknote className="w-5 h-5 text-slate-950" />
                  <span>{isEvaluating ? 'PROCESSING...' : `TAKE ₹${session.current_reward} & LEAVE`}</span>
                </button>
              </div>
            </div>
          ) : isQuestionPhase ? (
            <QuestionCard
              question={activeQuestion!}
              onSelectOption={handleSelectOption}
              disabled={isEvaluating || selectedOption !== null}
              selectedOption={selectedOption}
              revealedCorrectOption={revealedCorrectOption}
              isEvaluating={isEvaluating}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Wheel
                selectedColor={selectedColorForWheel}
                isSpinning={isSpinning}
                onSpinComplete={handleWheelLanded}
                onSpinStart={handleSpinStart}
                disabled={isRiskPhase}
              />
            </div>
          )}
        </div>

        {/* RIGHT STAGE: ARCADE HUD CONSOLE */}
        <div className="flex items-center justify-center">
          <ArcadeConsole
            currentLevel={session.current_level}
            currentReward={session.current_reward}
            isTimerActive={isQuestionPhase && !revealedCorrectOption}
            onTimeout={handleTimeout}
            presentedAt={activeQuestion?.presented_at}
            hintAvailable={session.lifeline_hint_available}
            fiftyFiftyAvailable={session.lifeline_fifty_fifty_available}
            onUseHint={handleUseHint}
            onUseFiftyFifty={handleUseFiftyFifty}
            isRiskPhase={isRiskPhase}
            onRiskContinue={handleRiskContinue}
            onCashOut={handleCashOut}
            disabled={isEvaluating}
          />
        </div>
      </div>

      {/* 4. MODALS (GAME OVER & LEVEL 15 / CASH OUT VICTORY) */}
      {isGameOverModalOpen && (
        <GameOverModal
          isTimeout={gameOverIsTimeout}
          levelReached={session.current_level}
          correctOption={correctOptionForModal}
          onResetGame={handleReset}
        />
      )}

      {isVictoryModalOpen && (
        <VictoryModal
          onResetGame={handleReset}
          reward={isCashOutModal ? cashOutReward : 150}
          isCashOut={isCashOutModal}
          levelReached={cashOutLevel}
        />
      )}
    </main>
  );
}
