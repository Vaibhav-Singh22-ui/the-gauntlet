import { NextRequest, NextResponse } from 'next/server';
import { AptitudeDifficulty, AptitudeGameType } from '@/lib/aptitude-games/types';
import { APTITUDE_GAMES } from '@/lib/aptitude-games/registry';
import { calculateRoundScore } from '@/lib/aptitude-games/scoring';
import {
  generateAptitudePuzzle,
  sanitizePuzzleForClient,
  validateAptitudeAnswer,
} from '@/lib/aptitude-games/puzzle-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gameType,
      difficulty,
      round,
      seed,
      answer,
      timeRemainingSeconds = 0,
      attempts = 1,
      currentScore = 0,
      currentStreak = 0,
    } = body;

    if (!gameType || !difficulty || !seed || round === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const meta = APTITUDE_GAMES[gameType as AptitudeGameType];
    if (!meta) {
      return NextResponse.json({ success: false, error: 'Invalid gameType' }, { status: 400 });
    }

    // 1. Authoritative Puzzle Generation
    const rawPuzzle = generateAptitudePuzzle(
      gameType as AptitudeGameType,
      difficulty as AptitudeDifficulty,
      seed,
      round
    );

    // 2. Authoritative Answer Validation
    const validation = validateAptitudeAnswer(gameType as AptitudeGameType, rawPuzzle, answer);

    if (!validation.correct) {
      return NextResponse.json({
        success: true,
        correct: false,
        explanation: validation.explanation,
        scoreEarned: 0,
        totalScore: currentScore,
        streak: 0,
        isGameComplete: false,
      });
    }

    // 3. Authoritative Scoring Calculation
    const newStreak = currentStreak + 1;
    const timeLimit = meta.timeLimit[difficulty as AptitudeDifficulty] || 30;
    const scoreResult = calculateRoundScore(
      difficulty as AptitudeDifficulty,
      timeRemainingSeconds,
      timeLimit,
      newStreak,
      attempts
    );

    const newTotalScore = currentScore + scoreResult.roundTotal;
    const isGameComplete = round >= meta.roundsPerGame;

    let nextPuzzle: any = null;
    if (!isGameComplete) {
      const nextRaw = generateAptitudePuzzle(
        gameType as AptitudeGameType,
        difficulty as AptitudeDifficulty,
        seed,
        round + 1
      );
      nextPuzzle = sanitizePuzzleForClient(gameType as AptitudeGameType, nextRaw);
    }

    return NextResponse.json({
      success: true,
      correct: true,
      explanation: validation.explanation,
      scoreEarned: scoreResult.roundTotal,
      totalScore: newTotalScore,
      streak: newStreak,
      isGameComplete,
      nextRound: isGameComplete ? undefined : round + 1,
      nextPuzzle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Validation error' },
      { status: 500 }
    );
  }
}
