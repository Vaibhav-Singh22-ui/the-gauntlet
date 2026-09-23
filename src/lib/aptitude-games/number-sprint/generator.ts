import { AptitudeDifficulty, NumberSprintPuzzle } from '../types';
import { SeededRandom } from '../seeded-random';

export function generateNumberSprintPuzzle(
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): NumberSprintPuzzle {
  const rng = new SeededRandom(`${seed}-NUMBER_SPRINT-${round}-${difficulty}`);
  const len = 6;
  let fullSeq: number[] = [];
  let patternName = '';
  let ruleExplanation = '';

  if (difficulty === 'EASY') {
    const patternType = rng.intBetween(1, 3);
    if (patternType === 1) {
      // Linear Arithmetic Progression
      const start = rng.intBetween(2, 20);
      const diff = rng.intBetween(3, 12);
      fullSeq = Array.from({ length: len }, (_, i) => start + i * diff);
      patternName = `Linear Progression (+${diff})`;
      ruleExplanation = `Each number increases by ${diff}.`;
    } else if (patternType === 2) {
      // Geometric Multiplication (x2 or x3)
      const ratio = rng.pick([2, 3]);
      const start = rng.intBetween(2, 5);
      fullSeq = Array.from({ length: len }, (_, i) => start * Math.pow(ratio, i));
      patternName = `Multiplication (×${ratio})`;
      ruleExplanation = `Each number is multiplied by ${ratio}.`;
    } else {
      // Squares Sequence
      const offset = rng.intBetween(1, 5);
      const shift = rng.intBetween(0, 3);
      fullSeq = Array.from({ length: len }, (_, i) => Math.pow(i + offset, 2) + shift);
      patternName = shift > 0 ? `Squares + ${shift}` : 'Perfect Squares';
      ruleExplanation = shift > 0 ? `Formula: (n + ${offset})² + ${shift}.` : `Consecutive squares starting at ${offset}².`;
    }
  } else if (difficulty === 'MEDIUM') {
    const patternType = rng.intBetween(1, 3);
    if (patternType === 1) {
      // Second Order Differences (differences increase: +d0, +d0+k, +d0+2k...)
      const start = rng.intBetween(2, 15);
      let diff = rng.intBetween(2, 6);
      const step = rng.pick([2, 3, 4]);
      fullSeq = [start];
      for (let i = 1; i < len; i++) {
        fullSeq.push(fullSeq[i - 1] + diff);
        diff += step;
      }
      patternName = `Increasing Step (+${step} to difference)`;
      ruleExplanation = `Differences between terms increase by ${step} each time.`;
    } else if (patternType === 2) {
      // Alternating Operations (*2, -k, *2, -k)
      const mul = 2;
      const sub = rng.intBetween(1, 4);
      let curr = rng.intBetween(3, 8);
      fullSeq = [curr];
      for (let i = 1; i < len; i++) {
        curr = i % 2 === 1 ? curr * mul : curr - sub;
        fullSeq.push(curr);
      }
      patternName = `Alternating (×${mul}, -${sub})`;
      ruleExplanation = `Alternate multiplying by ${mul} and subtracting ${sub}.`;
    } else {
      // Fibonacci-like Additive (sum of previous two)
      const a = rng.intBetween(1, 6);
      const b = rng.intBetween(2, 7);
      fullSeq = [a, b];
      for (let i = 2; i < len; i++) {
        fullSeq.push(fullSeq[i - 1] + fullSeq[i - 2]);
      }
      patternName = 'Fibonacci Additive Sum';
      ruleExplanation = 'Each term is the sum of the preceding two terms.';
    }
  } else {
    // HARD
    const patternType = rng.intBetween(1, 3);
    if (patternType === 1) {
      // Interleaved Dual Series (two alternating independent series)
      const aStart = rng.intBetween(5, 20);
      const aDiff = rng.intBetween(3, 7);
      const bStart = rng.intBetween(50, 100);
      const bDiff = rng.intBetween(4, 8);
      fullSeq = [];
      for (let i = 0; i < len; i++) {
        if (i % 2 === 0) {
          fullSeq.push(aStart + (i / 2) * aDiff);
        } else {
          fullSeq.push(bStart - Math.floor(i / 2) * bDiff);
        }
      }
      patternName = 'Interleaved Dual Series';
      ruleExplanation = `Two alternating streams: odd positions (+${aDiff}), even positions (-${bDiff}).`;
    } else if (patternType === 2) {
      // Recurrence: a_n = 2 * a_{n-1} + k
      const k = rng.pick([-3, -1, 1, 3, 5]);
      let curr = rng.intBetween(2, 5);
      fullSeq = [curr];
      for (let i = 1; i < len; i++) {
        curr = curr * 2 + k;
        fullSeq.push(curr);
      }
      patternName = `Affine Recurrence (×2 ${k >= 0 ? '+' : ''}${k})`;
      ruleExplanation = `Each term is calculated by (2 × previous) ${k >= 0 ? '+' : ''}${k}.`;
    } else {
      // Cubic progression / n^3 +/- k
      const offset = rng.intBetween(1, 3);
      const k = rng.intBetween(1, 5);
      fullSeq = Array.from({ length: len }, (_, i) => Math.pow(i + offset, 3) + k);
      patternName = `Cubic Progression (n³ + ${k})`;
      ruleExplanation = `Formula: (n + ${offset})³ + ${k}.`;
    }
  }

  // Choose missing index: prefer indices 2, 3, or 4 so context exists
  const missingIndex = rng.pick([2, 3, 4]);
  const correctAnswer = fullSeq[missingIndex];

  const displaySeq: Array<number | null> = [...fullSeq];
  displaySeq[missingIndex] = null;

  return {
    id: `NS-${difficulty}-R${round}`,
    sequence: displaySeq,
    missingIndex,
    correctAnswer,
    patternName,
    ruleExplanation,
  };
}
