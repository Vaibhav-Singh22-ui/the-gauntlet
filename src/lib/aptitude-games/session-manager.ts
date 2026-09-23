import { AptitudeDifficulty, AptitudeGameType, AptitudeSession, ValidationResponse } from './types';
import { APTITUDE_GAMES } from './registry';
import { calculateRoundScore } from './scoring';
import { generateAptitudePuzzle, sanitizePuzzleForClient, validateAptitudeAnswer } from './puzzle-service';
import { supabase } from '@/lib/supabase';

const STORAGE_SESSION_PREFIX = 'aptitude_session_';
const HIGH_SCORES_KEY = 'aptitude_high_scores';

export function getStoredHighScore(gameType: AptitudeGameType, difficulty: AptitudeDifficulty): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    if (!raw) return 0;
    const scores = JSON.parse(raw);
    return scores[`${gameType}_${difficulty}`] || 0;
  } catch {
    return 0;
  }
}

export function recordHighScore(gameType: AptitudeGameType, difficulty: AptitudeDifficulty, score: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    const scores = raw ? JSON.parse(raw) : {};
    const key = `${gameType}_${difficulty}`;
    if ((scores[key] || 0) < score) {
      scores[key] = score;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    }
  } catch {}
}

/**
 * Initializes a new game session
 */
export function startAptitudeGame(
  gameType: AptitudeGameType,
  difficulty: AptitudeDifficulty
): { session: AptitudeSession; initialPuzzle: any } {
  const meta = APTITUDE_GAMES[gameType];
  const timeLimit = meta.timeLimit[difficulty] || 30;
  const seed = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const sessionId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const session: AptitudeSession = {
    id: sessionId,
    gameType,
    difficulty,
    round: 1,
    totalRounds: meta.roundsPerGame || 5,
    score: 0,
    streak: 0,
    maxStreak: 0,
    timeLimitSeconds: timeLimit,
    timeRemaining: timeLimit,
    attempts: 0,
    status: 'ACTIVE',
    seed,
    startedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_SESSION_PREFIX + sessionId, JSON.stringify(session));
  }

  // Generate Round 1 puzzle
  const rawPuzzle = generateAptitudePuzzle(gameType, difficulty, seed, 1);
  const clientPuzzle = sanitizePuzzleForClient(gameType, rawPuzzle);

  // Sync to remote Supabase asynchronously
  try {
    supabase
      .from('aptitude_game_sessions')
      .insert({
        id: sessionId,
        game_type: gameType,
        difficulty,
        round: 1,
        total_rounds: meta.roundsPerGame || 5,
        score: 0,
        streak: 0,
        status: 'ACTIVE',
        seed,
      })
      .then(() => {}, () => {});
  } catch {}

  return { session, initialPuzzle: clientPuzzle };
}

/**
 * Validates player answer and advances the session state
 */
export function submitAptitudeAnswer(
  session: AptitudeSession,
  answer: any,
  timeRemainingSeconds: number
): ValidationResponse {
  const rawPuzzle = generateAptitudePuzzle(
    session.gameType,
    session.difficulty,
    session.seed,
    session.round
  );

  const validation = validateAptitudeAnswer(session.gameType, rawPuzzle, answer);
  session.attempts += 1;

  let scoreEarned = 0;
  if (validation.correct) {
    const newStreak = session.streak + 1;
    session.streak = newStreak;
    if (newStreak > session.maxStreak) {
      session.maxStreak = newStreak;
    }

    const scoreResult = calculateRoundScore(
      session.difficulty,
      timeRemainingSeconds,
      session.timeLimitSeconds,
      newStreak,
      session.attempts
    );
    scoreEarned = scoreResult.roundTotal;
    session.score += scoreEarned;
  } else {
    session.streak = 0;
  }

  const isComplete = session.round >= session.totalRounds;

  let nextRoundPuzzle: any = null;
  if (!isComplete) {
    session.round += 1;
    session.attempts = 0; // reset attempts for next round
    const nextRaw = generateAptitudePuzzle(
      session.gameType,
      session.difficulty,
      session.seed,
      session.round
    );
    nextRoundPuzzle = sanitizePuzzleForClient(session.gameType, nextRaw);
  } else {
    session.status = 'COMPLETED';
    session.completedAt = new Date().toISOString();
    recordHighScore(session.gameType, session.difficulty, session.score);
  }

  // Save session state
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_SESSION_PREFIX + session.id, JSON.stringify(session));
  }

  // Async remote sync
  try {
    supabase
      .from('aptitude_game_sessions')
      .update({
        round: session.round,
        score: session.score,
        streak: session.streak,
        max_streak: session.maxStreak,
        status: session.status,
        completed_at: session.completedAt,
      })
      .eq('id', session.id)
      .then(() => {}, () => {});
  } catch {}

  return {
    success: true,
    correct: validation.correct,
    explanation: validation.explanation,
    scoreEarned,
    totalScore: session.score,
    streak: session.streak,
    isGameComplete: isComplete,
    nextRound: isComplete ? undefined : session.round,
    nextPuzzle: nextRoundPuzzle,
  };
}
