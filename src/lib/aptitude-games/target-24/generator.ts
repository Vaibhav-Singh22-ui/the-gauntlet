import { AptitudeDifficulty, Target24Puzzle } from '../types';
import { SeededRandom } from '../seeded-random';

interface Target24Preset {
  numbers: number[];
  solution: string;
}

const EASY_PRESETS: Target24Preset[] = [
  { numbers: [1, 2, 3, 4], solution: '(1 + 2 + 3) * 4' },
  { numbers: [2, 3, 4, 6], solution: '2 + (3 * 6) + 4' },
  { numbers: [1, 5, 5, 1], solution: '(1 + 5) * (5 - 1)' },
  { numbers: [3, 4, 6, 8], solution: '(3 * 4 - 8) * 6' },
  { numbers: [2, 4, 4, 8], solution: '(2 + 4 / 4) * 8' },
  { numbers: [2, 3, 4, 8], solution: '(4 + 2 - 3) * 8' },
  { numbers: [1, 2, 8, 9], solution: '2 * 8 - 1 + 9' },
  { numbers: [2, 3, 6, 8], solution: '(2 + 8) * 3 - 6' },
  { numbers: [1, 2, 6, 9], solution: '1 * 2 * 9 + 6' },
  { numbers: [2, 3, 4, 5], solution: '2 * (3 + 4 + 5)' },
  { numbers: [2, 2, 6, 8], solution: '2 * (2 + 6) + 8' },
  { numbers: [3, 3, 6, 6], solution: '3 * (6 / 3 + 6)' },
];

const MEDIUM_PRESETS: Target24Preset[] = [
  { numbers: [3, 3, 7, 7], solution: '(3 + 3 / 7) * 7' },
  { numbers: [4, 4, 7, 7], solution: '(4 - 4 / 7) * 7' },
  { numbers: [2, 5, 5, 10], solution: '(5 - 2 / 10) * 5' },
  { numbers: [2, 4, 10, 10], solution: '(2 + 4 / 10) * 10' },
  { numbers: [1, 6, 6, 8], solution: '6 / (1 - 6 / 8)' },
  { numbers: [1, 2, 7, 7], solution: '(7 * 7 - 1) / 2' },
  { numbers: [3, 4, 4, 8], solution: '(3 + 4 - 4) * 8' },
  { numbers: [2, 3, 6, 7], solution: '(2 * 7 - 6) * 3' },
  { numbers: [2, 5, 7, 8], solution: '(2 * 5 - 7) * 8' },
  { numbers: [3, 5, 7, 8], solution: '3 - (5 - 8) * 7' },
  { numbers: [4, 5, 7, 8], solution: '4 + 5 + 7 + 8' },
  { numbers: [2, 6, 7, 9], solution: '2 + 6 + 7 + 9' },
];

const HARD_PRESETS: Target24Preset[] = [
  { numbers: [3, 3, 8, 8], solution: '8 / (3 - 8 / 3)' },
  { numbers: [1, 3, 4, 6], solution: '6 / (1 - 3 / 4)' },
  { numbers: [1, 5, 5, 5], solution: '(5 - 1 / 5) * 5' },
  { numbers: [4, 4, 10, 10], solution: '(10 * 10 - 4) / 4' },
  { numbers: [1, 4, 5, 6], solution: '4 / (1 - 5 / 6)' },
  { numbers: [2, 7, 8, 9], solution: '2 * (7 + 9) - 8' },
  { numbers: [3, 7, 8, 8], solution: '3 * (7 + 8 / 8)' },
  { numbers: [5, 5, 7, 11], solution: '5 * (7 - 11 / 5)' },
  { numbers: [2, 3, 5, 12], solution: '12 / (3 - 5 / 2)' },
  { numbers: [3, 8, 8, 9], solution: '3 * 8 * (9 - 8)' },
  { numbers: [2, 8, 9, 9], solution: '(2 + 9 / 9) * 8' },
  { numbers: [2, 4, 6, 8], solution: '(2 / 4) * 6 * 8' },
];

export function generateTarget24Puzzle(
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): Target24Puzzle {
  const rng = new SeededRandom(`${seed}-TARGET_24-${round}-${difficulty}`);
  const pool =
    difficulty === 'EASY'
      ? EASY_PRESETS
      : difficulty === 'MEDIUM'
      ? MEDIUM_PRESETS
      : HARD_PRESETS;

  // Pick deterministically based on round
  const preset = pool[(round - 1 + Math.floor(rng.next() * pool.length)) % pool.length];

  // Shuffle the 4 numbers so they don't always appear in numerical order
  const shuffledNumbers = rng.shuffle(preset.numbers);

  return {
    id: `T24-${difficulty}-R${round}`,
    numbers: shuffledNumbers,
    target: 24,
    knownSolutions: [preset.solution],
  };
}
