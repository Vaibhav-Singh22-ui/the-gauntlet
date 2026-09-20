'use client';

import React, { useState } from 'react';
import { Lightbulb, Split, X } from 'lucide-react';

interface LifelinesProps {
  hintAvailable: boolean;
  fiftyFiftyAvailable: boolean;
  onUseHint: () => Promise<string | null>;
  onUseFiftyFifty: () => Promise<void>;
  disabled: boolean;
}

export default function Lifelines({
  hintAvailable,
  fiftyFiftyAvailable,
  onUseHint,
  onUseFiftyFifty,
  disabled,
}: LifelinesProps) {
  const [hintText, setHintText] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingFifty, setLoadingFifty] = useState(false);

  const handleHintClick = async () => {
    if (!hintAvailable || disabled || loadingHint) return;
    setLoadingHint(true);
    try {
      const clue = await onUseHint();
      if (clue) {
        setHintText(clue);
      }
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

  return (
    <div className="flex items-center gap-3">
      {/* 50:50 Lifeline Button */}
      <button
        onClick={handleFiftyClick}
        disabled={!fiftyFiftyAvailable || disabled || loadingFifty}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow-md cursor-pointer ${
          fiftyFiftyAvailable && !disabled
            ? 'bg-[#151827] border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 active:scale-95'
            : 'bg-[#0e101a] border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
        }`}
        title={fiftyFiftyAvailable ? 'Remove 2 Incorrect Choices' : '50:50 Lifeline Exhausted'}
      >
        <Split className="w-4 h-4 text-amber-400" />
        <span>50:50</span>
        <span
          className={`w-2 h-2 rounded-full ${
            fiftyFiftyAvailable ? 'bg-amber-400' : 'bg-slate-700'
          }`}
        />
      </button>

      {/* Hint Lifeline Button */}
      <button
        onClick={handleHintClick}
        disabled={!hintAvailable || disabled || loadingHint}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow-md cursor-pointer ${
          hintAvailable && !disabled
            ? 'bg-[#151827] border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 active:scale-95'
            : 'bg-[#0e101a] border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
        }`}
        title={hintAvailable ? 'Get a Subtle Directional Clue' : 'Hint Lifeline Exhausted'}
      >
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <span>Hint</span>
        <span
          className={`w-2 h-2 rounded-full ${
            hintAvailable ? 'bg-amber-400' : 'bg-slate-700'
          }`}
        />
      </button>

      {/* Hint Modal Clue Popover */}
      {hintText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#121422] border border-amber-500/60 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setHintText(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-3">
              <Lightbulb className="w-6 h-6" />
              <h3 className="font-display font-extrabold text-lg uppercase tracking-wider">
                Directional Clue
              </h3>
            </div>

            <p className="text-slate-200 text-sm md:text-base leading-relaxed bg-[#181b2e] p-4 rounded-xl border border-slate-800">
              "{hintText}"
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setHintText(null)}
                className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
