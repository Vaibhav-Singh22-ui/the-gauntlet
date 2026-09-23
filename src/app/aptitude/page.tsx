'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Zap, ShieldAlert } from 'lucide-react';
import { audio } from '@/lib/audio';
import { APTITUDE_GAMES, ALL_GAME_TYPES } from '@/lib/aptitude-games/registry';
import GameCard from '@/components/aptitude/GameCard';

export default function AptitudeHubPage() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(audio.getMuted());
    const unsub = audio.subscribe((m) => setMuted(m));
    return unsub;
  }, []);

  const toggleSound = () => {
    const next = audio.toggleMute();
    setMuted(next);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col select-none pb-12">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP ARCADE BAR */}
      <header className="relative w-full px-6 py-4 flex items-center justify-between z-20 border-b border-slate-800/80 bg-black/40 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-amber-300 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>50 Millionaire Arena</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem-Solving Arcade</span>
          </div>

          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md ${
              muted
                ? 'bg-black/60 border-red-500/60 text-red-400 hover:bg-red-950/40'
                : 'bg-black/60 border-amber-500/60 text-amber-300 hover:bg-amber-950/40'
            }`}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center z-10">
        <div className="text-center max-w-2xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300 mb-4 shadow-md">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Mental Training</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel tracking-wider text-slate-100 uppercase leading-none">
            APTITUDE <span className="gold-metallic-text">GAMES</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
            Train your speed. Test your logic. Beat your best score.
            <br />
            Interactive, procedural challenges designed to sharpen your quantitative intuition.
          </p>
        </div>

        {/* GAMES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
          {ALL_GAME_TYPES.map((type) => (
            <GameCard key={type} game={APTITUDE_GAMES[type]} />
          ))}
        </div>

        {/* BOTTOM ADVICE / INFO STRIP */}
        <div className="w-full max-w-3xl p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 text-slate-400 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Server-Authoritative Validation</strong>: Each puzzle is deterministically generated and verified server-side. Scores reflect accuracy and speed bonuses.
            </span>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold uppercase tracking-wider text-[10px] border border-amber-500/40 transition-all flex-shrink-0"
          >
            Play 50 Millionaire
          </Link>
        </div>
      </main>
    </div>
  );
}
