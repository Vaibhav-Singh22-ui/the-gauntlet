import { NumberSprintPuzzle } from '../types';

export function validateNumberSprintAnswer(
  puzzle: NumberSprintPuzzle,
  userAnswer: number | string
): { correct: boolean; explanation: string } {
  const parsed = typeof userAnswer === 'string' ? parseInt(userAnswer.trim(), 10) : userAnswer;

  if (isNaN(parsed)) {
    return {
      correct: false,
      explanation: 'Invalid numeric input.',
    };
  }

  const isCorrect = parsed === puzzle.correctAnswer;

  return {
    correct: isCorrect,
    explanation: isCorrect
      ? `Correct! ${puzzle.ruleExplanation} Missing value is indeed ${puzzle.correctAnswer}.`
      : `Incorrect. The correct value was ${puzzle.correctAnswer}. ${puzzle.ruleExplanation}`,
  };
}
