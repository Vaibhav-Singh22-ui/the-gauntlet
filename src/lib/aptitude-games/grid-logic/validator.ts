import { GridLogicPuzzle } from '../types';

export function validateGridLogicAnswer(
  puzzle: GridLogicPuzzle,
  userAnswer: number | string
): { correct: boolean; explanation: string } {
  const parsed = typeof userAnswer === 'string' ? parseInt(userAnswer.trim(), 10) : userAnswer;

  if (isNaN(parsed)) {
    return { correct: false, explanation: 'Invalid numeric input.' };
  }

  const isCorrect = parsed === puzzle.correctAnswer;

  return {
    correct: isCorrect,
    explanation: isCorrect
      ? `Correct! Cell [${puzzle.targetRow + 1}, ${puzzle.targetCol + 1}] is ${puzzle.correctAnswer}. ${puzzle.ruleDescription}`
      : `Incorrect. The correct answer was ${puzzle.correctAnswer}. ${puzzle.ruleDescription}`,
  };
}
