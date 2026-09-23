import { AptitudeDifficulty, AptitudeGameType } from './types';
import { generateNumberSprintPuzzle } from './number-sprint/generator';
import { validateNumberSprintAnswer } from './number-sprint/validator';
import { generateTarget24Puzzle } from './target-24/generator';
import { validateTarget24Answer } from './target-24/validator';
import { generateGridLogicPuzzle } from './grid-logic/generator';
import { validateGridLogicAnswer } from './grid-logic/validator';
import { generateMissingPiecePuzzle } from './missing-piece/generator';
import { validateMissingPieceAnswer } from './missing-piece/validator';
import { generateArrangementPuzzle } from './arrangement-master/generator';
import { validateArrangementAnswer } from './arrangement-master/validator';

/**
 * Unified Generator for any Aptitude Game
 */
export function generateAptitudePuzzle(
  gameType: AptitudeGameType,
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): any {
  switch (gameType) {
    case 'NUMBER_SPRINT':
      return generateNumberSprintPuzzle(difficulty, seed, round);
    case 'TARGET_24':
      return generateTarget24Puzzle(difficulty, seed, round);
    case 'GRID_LOGIC':
      return generateGridLogicPuzzle(difficulty, seed, round);
    case 'MISSING_PIECE':
      return generateMissingPiecePuzzle(difficulty, seed, round);
    case 'ARRANGEMENT_MASTER':
      return generateArrangementPuzzle(difficulty, seed, round);
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
}

/**
 * Sanitizes puzzle payload for client (omits hidden internal answers where appropriate)
 */
export function sanitizePuzzleForClient(gameType: AptitudeGameType, puzzle: any): any {
  if (gameType === 'NUMBER_SPRINT') {
    const { correctAnswer, ...clientView } = puzzle;
    return clientView;
  }
  if (gameType === 'TARGET_24') {
    const { knownSolutions, ...clientView } = puzzle;
    return clientView;
  }
  if (gameType === 'GRID_LOGIC') {
    const { correctAnswer, ...clientView } = puzzle;
    return clientView;
  }
  if (gameType === 'MISSING_PIECE') {
    const { correctCandidateIndex, ...clientView } = puzzle;
    return clientView;
  }
  if (gameType === 'ARRANGEMENT_MASTER') {
    const { targetSolution, ...clientView } = puzzle;
    return clientView;
  }
  return puzzle;
}

/**
 * Unified Validator for any Aptitude Game
 */
export function validateAptitudeAnswer(
  gameType: AptitudeGameType,
  puzzle: any,
  userAnswer: any
): { correct: boolean; explanation: string; [key: string]: any } {
  switch (gameType) {
    case 'NUMBER_SPRINT':
      return validateNumberSprintAnswer(puzzle, userAnswer);
    case 'TARGET_24':
      return validateTarget24Answer(puzzle, String(userAnswer));
    case 'GRID_LOGIC':
      return validateGridLogicAnswer(puzzle, userAnswer);
    case 'MISSING_PIECE':
      return validateMissingPieceAnswer(puzzle, Number(userAnswer));
    case 'ARRANGEMENT_MASTER':
      return validateArrangementAnswer(puzzle, userAnswer);
    default:
      return { correct: false, explanation: 'Unknown game type.' };
  }
}
