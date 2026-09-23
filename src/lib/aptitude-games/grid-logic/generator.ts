import { AptitudeDifficulty, GridLogicPuzzle } from '../types';
import { SeededRandom } from '../seeded-random';

export function generateGridLogicPuzzle(
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): GridLogicPuzzle {
  const rng = new SeededRandom(`${seed}-GRID_LOGIC-${round}-${difficulty}`);

  let grid: Array<Array<number | null>> = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let ruleDescription = '';

  if (difficulty === 'EASY') {
    const type = rng.intBetween(1, 2);
    if (type === 1) {
      // Row Sum is Constant
      const targetSum = rng.pick([20, 24, 30, 36, 40]);
      for (let r = 0; r < 3; r++) {
        const c1 = rng.intBetween(3, Math.floor(targetSum / 3));
        const c2 = rng.intBetween(4, Math.floor(targetSum / 2));
        const c3 = targetSum - c1 - c2;
        grid[r] = [c1, c2, c3];
      }
      ruleDescription = `The sum of numbers in every horizontal row equals ${targetSum}.`;
    } else {
      // Row Addition: Col 3 = Col 1 + Col 2
      for (let r = 0; r < 3; r++) {
        const c1 = rng.intBetween(4, 18);
        const c2 = rng.intBetween(5, 25);
        grid[r] = [c1, c2, c1 + c2];
      }
      ruleDescription = 'In each horizontal row: Column 1 + Column 2 = Column 3.';
    }
  } else if (difficulty === 'MEDIUM') {
    const type = rng.intBetween(1, 2);
    if (type === 1) {
      // Row Multiplication: Col 3 = Col 1 * Col 2
      for (let r = 0; r < 3; r++) {
        const c1 = rng.intBetween(3, 9);
        const c2 = rng.intBetween(4, 12);
        grid[r] = [c1, c2, c1 * c2];
      }
      ruleDescription = 'In each horizontal row: Column 1 × Column 2 = Column 3.';
    } else {
      // Column scaling: Col 2 = Col 1 * 2, Col 3 = Col 1 * 3 + offset
      const offset = rng.pick([1, 2, 3]);
      for (let r = 0; r < 3; r++) {
        const base = rng.intBetween(4, 12) + r * 2;
        grid[r] = [base, base * 2, base * 3 + offset];
      }
      ruleDescription = `Col 2 is 2× Col 1, and Col 3 is 3× Col 1 + ${offset}.`;
    }
  } else {
    // HARD
    const type = rng.intBetween(1, 2);
    if (type === 1) {
      // Combined Operation: Col 3 = (Col 1 * Col 2) - Col 1
      for (let r = 0; r < 3; r++) {
        const c1 = rng.intBetween(4, 8);
        const c2 = rng.intBetween(5, 9);
        grid[r] = [c1, c2, c1 * c2 - c1];
      }
      ruleDescription = 'In each row: Column 3 = (Column 1 × Column 2) - Column 1.';
    } else {
      // Difference of squares / square offset: Col 3 = Col 1^2 + Col 2
      for (let r = 0; r < 3; r++) {
        const c1 = rng.intBetween(3, 7);
        const c2 = rng.intBetween(2, 10);
        grid[r] = [c1, c2, c1 * c1 + c2];
      }
      ruleDescription = 'In each row: Column 3 = (Column 1)² + Column 2.';
    }
  }

  // Target cell: bottom-right (2,2) or middle-right (1,2)
  const targetRow = rng.pick([1, 2]);
  const targetCol = 2; // rightmost column ensures clear row rule
  const correctAnswer = grid[targetRow][targetCol] as number;

  grid[targetRow][targetCol] = null;

  return {
    id: `GL-${difficulty}-R${round}`,
    gridSize: 3,
    grid,
    targetRow,
    targetCol,
    correctAnswer,
    ruleDescription,
  };
}
