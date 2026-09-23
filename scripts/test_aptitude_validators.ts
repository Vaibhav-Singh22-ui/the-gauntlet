import { validateTarget24Answer } from '../src/lib/aptitude-games/target-24/validator';
import { validateNumberSprintAnswer } from '../src/lib/aptitude-games/number-sprint/validator';
import { validateGridLogicAnswer } from '../src/lib/aptitude-games/grid-logic/validator';
import { validateMissingPieceAnswer } from '../src/lib/aptitude-games/missing-piece/validator';
import { validateArrangementAnswer } from '../src/lib/aptitude-games/arrangement-master/validator';

console.log('=== TESTING APTITUDE PUZZLE VALIDATORS ===\n');

// 1. Target 24 Validator Tests
console.log('1. Testing Target 24 Expression Validator:');

// Test A: Classic fractional 8 / (3 - 8/3) = 24
const t24A = { id: 't1', numbers: [3, 3, 8, 8], target: 24, knownSolutions: [] };
const resA = validateTarget24Answer(t24A, '8 / (3 - 8 / 3)');
console.log('   Test [3, 3, 8, 8] with "8 / (3 - 8 / 3)":', resA.correct ? '✓ PASS' : '✗ FAIL');
if (!resA.correct) throw new Error(`Target 24 failed: ${resA.explanation}`);

// Test B: Simple (1 + 2 + 3) * 4 = 24
const t24B = { id: 't2', numbers: [1, 2, 3, 4], target: 24, knownSolutions: [] };
const resB = validateTarget24Answer(t24B, '(1 + 2 + 3) * 4');
console.log('   Test [1, 2, 3, 4] with "(1 + 2 + 3) * 4":', resB.correct ? '✓ PASS' : '✗ FAIL');
if (!resB.correct) throw new Error(`Target 24 failed: ${resB.explanation}`);

// Test C: Missing number rejection
const resC = validateTarget24Answer(t24B, '(1 + 2) * 4');
console.log('   Test missing number rejection:', !resC.correct ? '✓ PASS (Rejected correctly)' : '✗ FAIL');
if (resC.correct) throw new Error('Target 24 failed to reject missing numbers');

// Test D: Evaluates to wrong number rejection
const resD = validateTarget24Answer(t24B, '1 + 2 + 3 + 4');
console.log('   Test wrong total rejection:', !resD.correct ? '✓ PASS (Rejected correctly)' : '✗ FAIL');
if (resD.correct) throw new Error('Target 24 failed to reject wrong total');

// 2. Number Sprint Validator Tests
console.log('\n2. Testing Number Sprint Validator:');
const nsPuzzle = {
  id: 'ns1',
  sequence: [2, 4, null, 8, 10, 12],
  missingIndex: 2,
  correctAnswer: 6,
  patternName: 'AP',
  ruleExplanation: '+2',
};
const nsGood = validateNumberSprintAnswer(nsPuzzle, 6);
const nsBad = validateNumberSprintAnswer(nsPuzzle, 7);
console.log('   Correct answer check:', nsGood.correct ? '✓ PASS' : '✗ FAIL');
console.log('   Incorrect answer check:', !nsBad.correct ? '✓ PASS' : '✗ FAIL');
if (!nsGood.correct || nsBad.correct) throw new Error('Number Sprint validation failed');

// 3. Grid Logic Validator Tests
console.log('\n3. Testing Grid Logic Validator:');
const glPuzzle = {
  id: 'gl1',
  gridSize: 3 as const,
  grid: [[1, 2, 3], [4, 5, 6], [7, 8, null]],
  targetRow: 2,
  targetCol: 2,
  correctAnswer: 9,
  ruleDescription: 'Sequential',
};
const glGood = validateGridLogicAnswer(glPuzzle, '9');
const glBad = validateGridLogicAnswer(glPuzzle, '10');
console.log('   Correct cell check:', glGood.correct ? '✓ PASS' : '✗ FAIL');
console.log('   Incorrect cell check:', !glBad.correct ? '✓ PASS' : '✗ FAIL');
if (!glGood.correct || glBad.correct) throw new Error('Grid Logic validation failed');

// 4. Missing Piece Validator Tests
console.log('\n4. Testing Missing Piece Validator:');
const mpPuzzle = {
  id: 'mp1',
  matrix: [],
  candidates: [{} as any, {} as any, {} as any, {} as any],
  correctCandidateIndex: 2,
  ruleExplanation: 'Rotation rule',
};
const mpGood = validateMissingPieceAnswer(mpPuzzle, 2);
const mpBad = validateMissingPieceAnswer(mpPuzzle, 0);
console.log('   Correct piece index check:', mpGood.correct ? '✓ PASS' : '✗ FAIL');
console.log('   Incorrect piece index check:', !mpBad.correct ? '✓ PASS' : '✗ FAIL');
if (!mpGood.correct || mpBad.correct) throw new Error('Missing Piece validation failed');

// 5. Arrangement Master Validator Tests
console.log('\n5. Testing Arrangement Master Validator:');
const amPuzzle = {
  id: 'am1',
  entities: [
    { id: 'A', label: 'A', color: '' },
    { id: 'B', label: 'B', color: '' },
    { id: 'C', label: 'C', color: '' },
  ],
  constraints: [
    { id: 'c1', type: 'BEFORE' as const, entityA: 'A', entityB: 'B', description: 'A before B' },
    { id: 'c2', type: 'IMMEDIATELY_BEFORE' as const, entityA: 'B', entityB: 'C', description: 'B before C' },
  ],
  targetSolution: ['A', 'B', 'C'],
};
const amGood = validateArrangementAnswer(amPuzzle, ['A', 'B', 'C']);
const amBad = validateArrangementAnswer(amPuzzle, ['B', 'A', 'C']);
console.log('   Correct arrangement check:', amGood.correct ? '✓ PASS' : '✗ FAIL');
console.log('   Violated arrangement check:', !amBad.correct ? '✓ PASS' : '✗ FAIL');
if (!amGood.correct || amBad.correct) throw new Error('Arrangement Master validation failed');

console.log('\nALL 5 APTITUDE PUZZLE VALIDATORS PASSED ALL TESTS!');
