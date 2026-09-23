'use client';

import React, { useEffect } from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';
import { aptitudeSound } from '@/lib/aptitude-games/sound';

interface NumberPadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  allowNegative?: boolean;
  maxLength?: number;
}

export default function NumberPad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  allowNegative = true,
  maxLength = 6,
}: NumberPadProps) {
  // Listen to physical keyboard events
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (value.length < maxLength) {
          aptitudeSound.playKeyClick();
          onChange(value + e.key);
        }
      } else if (e.key === 'Backspace') {
        aptitudeSound.playKeyClick();
        onChange(value.slice(0, -1));
      } else if (e.key === 'Escape') {
        aptitudeSound.playKeyClick();
        onChange('');
      } else if (e.key === 'Enter') {
        if (value.trim()) {
          onSubmit();
        }
      } else if (e.key === '-' && allowNegative) {
        aptitudeSound.playKeyClick();
        if (value.startsWith('-')) {
          onChange(value.slice(1));
        } else {
          onChange('-' + value);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onSubmit, disabled, allowNegative, maxLength]);

  const handleDigit = (d: string) => {
    if (disabled || value.length >= maxLength) return;
    aptitudeSound.playKeyClick();
    onChange(value + d);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    aptitudeSound.playKeyClick();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    aptitudeSound.playKeyClick();
    onChange('');
  };

  const handleToggleNegative = () => {
    if (disabled || !allowNegative) return;
    aptitudeSound.playKeyClick();
    if (value.startsWith('-')) {
      onChange(value.slice(1));
    } else {
      onChange('-' + value);
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col gap-2 select-none">
      {/* 3x4 Keypad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(digit)}
            className="h-12 sm:h-14 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/80 text-xl font-black font-display text-slate-100 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {digit}
          </button>
        ))}

        {/* Row 4: +/-, 0, Backspace */}
        {allowNegative ? (
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleNegative}
            className="h-12 sm:h-14 rounded-xl bg-slate-900/70 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-base font-black text-slate-400 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Toggle Negative"
          >
            ±
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="h-12 sm:h-14 rounded-xl bg-slate-900/70 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-xs font-bold text-slate-400 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="h-12 sm:h-14 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/80 text-xl font-black font-display text-slate-100 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          className="h-12 sm:h-14 rounded-xl bg-slate-900/70 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-slate-400 hover:text-slate-200 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-30"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] disabled:opacity-40 text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-1"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>SUBMIT ANSWER</span>
      </button>
    </div>
  );
}
