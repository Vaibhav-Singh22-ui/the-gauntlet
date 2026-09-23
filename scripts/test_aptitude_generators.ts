import { generateNumberSprintPuzzle } from '../src/lib/aptitude-games/number-sprint/generator';
import { generateTarget24Puzzle } from '../src/lib/aptitude-games/target-24/generator';
import { generateGridLogicPuzzle } from '../src/lib/aptitude-games/grid-logic/generator';
import { generateMissingPiecePuzzle } from '../src/lib/aptitude-games/missing-piece/generator';
import { generateArrangementPuzzle } from '../src/lib/aptitude-games/arrangement-master/generator';
import { AptitudeDifficulty } from '../src/lib/aptitude-games/types';

console.log('=== TESTING APTITUDE PUZZLE GENERATORS ===\n');

const difficulties: AptitudeDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

// 1. Test Number Sprint
console.log('1. Testing Number Sprint generator (30 puzzles)...');
for (const diff of difficulties) {
  for (let r = 1; r <= 10; r++) {
    const p = generateNumberSprintPuzzle(diff, `test-seed-${r}`, r);
    if (p.sequence.length !== 6 || p.missingIndex < 0 || p.missingIndex >= 6 || p.correctAnswer === undefined) {
      throw new Error(`Number Sprint generation failed: ${JSON.stringify(p)}`);
    }
  }
}
console.log('   ✓ Number Sprint OK across Easy, Medium, Hard.');

// 2. Test Target 24
console.log('2. Testing Target 24 generator (30 puzzles)...');
for (const diff of difficulties) {
  for (let r = 1; r <= 10; r++) {
    const p = generateTarget24Puzzle(diff, `test-seed-${r}`, r);
    if (p.numbers.length !== 4 || p.target !== 24 || p.knownSolutions.length === 0) {
      throw new Error(`Target 24 generation failed: ${JSON.stringify(p)}`);
    }
  }
}
console.log('   ✓ Target 24 OK across Easy, Medium, Hard.');

// 3. Test Grid Logic
console.log('3. Testing Grid Logic generator (30 puzzles)...');
for (const diff of difficulties) {
  for (let r = 1; r <= 10; r++) {
    const p = generateGridLogicPuzzle(diff, `test-seed-${r}`, r);
    if (p.grid.length !== 3 || p.grid[0].length !== 3 || p.correctAnswer === undefined) {
      throw new Error(`Grid Logic generation failed: ${JSON.stringify(p)}`);
    }
  }
}
console.log('   ✓ Grid Logic OK across Easy, Medium, Hard.');

// 4. Test Missing Piece
console.log('4. Testing Missing Piece generator (30 puzzles)...');
for (const diff of difficulties) {
  for (let r = 1; r <= 10; r++) {
    const p = generateMissingPiecePuzzle(diff, `test-seed-${r}`, r);
    if (p.matrix.length !== 3 || p.candidates.length < 4 || p.correctCandidateIndex === -1) {
      throw new Error(`Missing Piece generation failed: ${JSON.stringify(p)}`);
    }
  }
}
console.log('   ✓ Missing Piece OK across Easy, Medium, Hard.');

// 5. Test Arrangement Master
console.log('5. Testing Arrangement Master generator (30 puzzles)...');
for (const diff of difficulties) {
  for (let r = 1; r <= 10; r++) {
    const p = generateArrangementPuzzle(diff, `test-seed-${r}`, r);
    if (p.entities.length < 5 || p.constraints.length < 2 || p.targetSolution.length !== p.entities.length) {
      throw new Error(`Arrangement Master generation failed: ${JSON.stringify(p)}`);
    }
  }
}
console.log('   ✓ Arrangement Master OK across Easy, Medium, Hard.');

console.log('\nALL 5 APTITUDE PUZZLE GENERATORS PASSED CLEANLY (150 PUZZLES GENERATED)!');
