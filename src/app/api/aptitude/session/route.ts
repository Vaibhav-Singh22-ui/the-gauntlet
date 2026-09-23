import { NextRequest, NextResponse } from 'next/server';
import { AptitudeDifficulty, AptitudeGameType } from '@/lib/aptitude-games/types';
import { APTITUDE_GAMES } from '@/lib/aptitude-games/registry';
import { generateAptitudePuzzle, sanitizePuzzleForClient } from '@/lib/aptitude-games/puzzle-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gameType = body.gameType as AptitudeGameType;
    const difficulty = (body.difficulty || 'MEDIUM') as AptitudeDifficulty;

    if (!APTITUDE_GAMES[gameType]) {
      return NextResponse.json({ success: false, error: 'Invalid gameType' }, { status: 400 });
    }

    const meta = APTITUDE_GAMES[gameType];
    const timeLimit = meta.timeLimit[difficulty] || 30;
    const seed = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const sessionId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const rawPuzzle = generateAptitudePuzzle(gameType, difficulty, seed, 1);
    const clientPuzzle = sanitizePuzzleForClient(gameType, rawPuzzle);

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        gameType,
        difficulty,
        round: 1,
        totalRounds: meta.roundsPerGame || 5,
        score: 0,
        streak: 0,
        maxStreak: 0,
        timeLimitSeconds: timeLimit,
        seed,
        status: 'ACTIVE',
      },
      puzzle: clientPuzzle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initialize session' },
      { status: 500 }
    );
  }
}
