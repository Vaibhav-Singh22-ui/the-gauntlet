import { AptitudeDifficulty } from './types';

export interface ScoreCalculationResult {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  penalty: number;
  roundTotal: number;
}

const DIFFICULTY_BASE_POINTS: Record<AptitudeDifficulty, number> = {
  EASY: 100,
  MEDIUM: 150,
  HARD: 200,
};

/**
 * Calculates authoritative score for a completed round:
 * - base points by difficulty
 * - speed bonus (faster solves reward higher points)
 * - streak multiplier
 * - attempt deduction
 */
export function calculateRoundScore(
  difficulty: AptitudeDifficulty,
  timeRemainingSeconds: number,
  timeLimitSeconds: number,
  streak: number,
  attempts: number = 1
): ScoreCalculationResult {
  const basePoints = DIFFICULTY_BASE_POINTS[difficulty] || 100;

  // Speed bonus: up to 50% of base points proportional to time remaining
  const timeRatio = Math.max(0, Math.min(1, timeRemainingSeconds / Math.max(1, timeLimitSeconds)));
  const speedBonus = Math.round(basePoints * 0.5 * timeRatio);

  // Streak bonus: 25 points per active streak step (streak starts at 1 for current correct answer)
  const streakBonus = Math.max(0, (streak - 1) * 25);

  // Penalty for retry attempts (if player tried multiple times before succeeding)
  const penalty = Math.max(0, (attempts - 1) * 20);

  const roundTotal = Math.max(10, basePoints + speedBonus + streakBonus - penalty);

  return {
    basePoints,
    speedBonus,
    streakBonus,
    penalty,
    roundTotal,
  };
}
