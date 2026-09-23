'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AptitudeDifficulty, AptitudeSession, MissingPiecePuzzle } from '@/lib/aptitude-games/types';
import { startAptitudeGame } from '@/lib/aptitude-games/session-manager';
import AptitudeHeader from '@/components/aptitude/AptitudeHeader';
import CountdownOverlay from '@/components/aptitude/CountdownOverlay';
import MissingPieceGame from '@/components/aptitude/MissingPieceGame';

export default function MissingPiecePage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const rawDiff = (resolvedParams?.difficulty || 'MEDIUM').toUpperCase();
  const difficulty: AptitudeDifficulty =
    rawDiff === 'EASY' || rawDiff === 'HARD' ? rawDiff : 'MEDIUM';

  const [gameState, setGameState] = useState<{
    session: AptitudeSession;
    puzzle: MissingPiecePuzzle;
  } | null>(null);

  const [showCountdown, setShowCountdown] = useState(true);

  const initGame = () => {
    const { session, initialPuzzle } = startAptitudeGame('MISSING_PIECE', difficulty);
    setGameState({ session, puzzle: initialPuzzle });
    setShowCountdown(true);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  if (!gameState) return null;

  return (
    <div className="relative min-h-screen w-full bg-[#0d070b] text-slate-100 flex flex-col items-center select-none pb-12">
      {showCountdown && (
        <CountdownOverlay
          onComplete={() => setShowCountdown(false)}
          accentColor="#ec4899"
        />
      )}

      <AptitudeHeader
        title="MISSING PIECE"
        round={gameState.session.round}
        totalRounds={gameState.session.totalRounds}
        score={gameState.session.score}
        streak={gameState.session.streak}
        difficulty={difficulty}
        accentColor="#ec4899"
        onExit={() => router.push('/aptitude')}
      />

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 z-10">
        <MissingPieceGame
          initialSession={gameState.session}
          initialPuzzle={gameState.puzzle}
          onRestart={initGame}
        />
      </main>
    </div>
  );
}
