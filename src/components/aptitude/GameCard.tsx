'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Target, Grid, Puzzle, Layers, Play, Trophy, ChevronRight } from 'lucide-react';
import { GameMetadata, AptitudeDifficulty } from '@/lib/aptitude-games/types';
import { getStoredHighScore } from '@/lib/aptitude-games/session-manager';

interface GameCardProps {
  game: GameMetadata;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Grid: <Grid className="w-6 h-6" />,
  Puzzle: <Puzzle className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
};

export default function GameCard({ game }: GameCardProps) {
  const [difficulty, setDifficulty] = useState<AptitudeDifficulty>('MEDIUM');
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setHighScore(getStoredHighScore(game.id, difficulty));
  }, [game.id, difficulty]);

  return (
    <div className="group relative rounded-2xl p-6 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black border border-slate-800 hover:border-slate-600 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Dynamic Background Glow on Hover */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all pointer-events-none"
        style={{ backgroundColor: game.accentColor }}
      />

      {/* TOP HEADER: ICON & TITLE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${game.accentColor}15`,
              borderColor: `${game.accentColor}50`,
              color: game.accentColor,
            }}
          >
            {ICON_MAP[game.icon] || <Zap className="w-6 h-6" />}
          </div>

          {/* High Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{highScore} PTS</span>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black font-cinzel text-slate-100 tracking-wide uppercase group-hover:text-amber-300 transition-colors">
          {game.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {game.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS: DIFFICULTY SELECTOR & PLAY BUTTON */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
        {/* Difficulty Pill Selector */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            DIFFICULTY:
          </span>
          <div className="flex gap-1 bg-black/60 p-1 rounded-lg border border-slate-800">
            {(['EASY', 'MEDIUM', 'HARD'] as AptitudeDifficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`text-[10px] font-black px-2.5 py-1 rounded transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Play Action */}
        <Link
          href={`${game.route}?difficulty=${difficulty}`}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START {difficulty}</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
