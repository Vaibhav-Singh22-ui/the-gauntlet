import { MissingPiecePuzzle } from '../types';

export function validateMissingPieceAnswer(
  puzzle: MissingPiecePuzzle,
  selectedIndex: number
): { correct: boolean; explanation: string } {
  if (typeof selectedIndex !== 'number' || selectedIndex < 0 || selectedIndex >= puzzle.candidates.length) {
    return { correct: false, explanation: 'Please choose a candidate piece to place.' };
  }

  const isCorrect = selectedIndex === puzzle.correctCandidateIndex;

  return {
    correct: isCorrect,
    explanation: isCorrect
      ? `Correct piece selected! ${puzzle.ruleExplanation}`
      : `Incorrect choice. Piece #${puzzle.correctCandidateIndex + 1} completes the pattern. ${puzzle.ruleExplanation}`,
  };
}
