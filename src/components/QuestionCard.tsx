'use client';

import React from 'react';
import { ActiveQuestionData, AnswerOption, WHEEL_COLORS_CONFIG } from '@/types/game';

interface QuestionCardProps {
  question: ActiveQuestionData;
  onSelectOption: (option: AnswerOption) => void;
  disabled: boolean;
  selectedOption: AnswerOption | null;
  revealedCorrectOption: AnswerOption | null;
  isEvaluating: boolean;
}

export default function QuestionCard({
  question,
  onSelectOption,
  disabled,
  selectedOption,
  revealedCorrectOption,
  isEvaluating,
}: QuestionCardProps) {
  const optionsList: { key: AnswerOption; text: string }[] = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  const colorConfig = WHEEL_COLORS_CONFIG[question.selected_color];
  const removedSet = new Set(question.removed_options || []);

  const handleOptionClick = (key: AnswerOption) => {
    if (disabled || isEvaluating || selectedOption !== null || removedSet.has(key)) return;
    onSelectOption(key);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center select-none animate-fadeIn">
      {/* 1. QUESTION CONSOLE BADGES */}
      <div className="flex items-center gap-3 mb-3">
        <div className="px-4 py-1 rounded-full bg-[#121422] border border-amber-500/60 shadow-md flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            LEVEL {question.level}
          </span>
        </div>

        <div
          className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase shadow-md ${colorConfig.borderClass} ${colorConfig.textClass} bg-[#0e101a]`}
        >
          ★ {colorConfig.name} SECTOR ★
        </div>
      </div>

      {/* 2. MAIN QUESTION DISPLAY FRAME */}
      <div className="w-full console-frame rounded-2xl p-6 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.85)] border border-[#2a324d] relative mb-5">
        <p className="text-xl sm:text-2xl font-semibold text-slate-100 text-center leading-relaxed font-display drop-shadow-md">
          {question.question_text}
        </p>
      </div>

      {/* 3. 4 TACTILE ARCADE ANSWER BUTTONS (2x2) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {optionsList.map(({ key, text }) => {
          const isRemoved = removedSet.has(key);
          const isSelected = selectedOption === key;
          const isRevealedCorrect = revealedCorrectOption === key;
          const isRevealedWrong =
            revealedCorrectOption !== null && isSelected && revealedCorrectOption !== key;

          let btnClass =
            'bg-gradient-to-b from-[#161a29] to-[#0f121d] border-[#252c45] text-slate-200 hover:border-amber-400/90 hover:from-[#1c2236] hover:to-[#121624] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]';

          if (isRemoved) {
            btnClass = 'bg-[#0a0c12] border-[#151822] text-slate-600 opacity-20 cursor-not-allowed';
          } else if (isRevealedCorrect) {
            btnClass =
              'bg-gradient-to-b from-emerald-950 to-emerald-900 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.7)] font-bold';
          } else if (isRevealedWrong) {
            btnClass =
              'bg-gradient-to-b from-red-950 to-red-900 border-red-500 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.7)]';
          } else if (isSelected) {
            btnClass =
              'bg-gradient-to-b from-amber-950 to-amber-900 border-amber-400 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse';
          }

          return (
            <button
              key={key}
              onClick={() => handleOptionClick(key)}
              disabled={disabled || isEvaluating || isRemoved || selectedOption !== null}
              className={`relative flex items-center p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 shadow-lg cursor-pointer transform active:scale-98 ${btnClass} ${
                disabled || isRemoved ? 'cursor-not-allowed' : ''
              }`}
            >
              {/* Tactical Option Letter Tag [A], [B], [C], [D] */}
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black mr-3.5 shadow-inner transition-colors font-display ${
                  isRevealedCorrect
                    ? 'bg-emerald-400 text-slate-950'
                    : isRevealedWrong
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-[#1e243b] text-amber-400 border border-slate-700/60'
                }`}
              >
                {key}
              </span>

              {/* Option Text Statement */}
              <span
                className={`text-sm sm:text-base font-semibold leading-snug flex-1 ${
                  isRemoved ? 'line-through' : ''
                }`}
              >
                {text}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. SUSPENSE EVALUATION PULSE */}
      {isEvaluating && (
        <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Verifying Answer With Server...</span>
        </div>
      )}
    </div>
  );
}
