import { AptitudeDifficulty, MissingPiecePuzzle, VisualShapeConfig } from '../types';
import { SeededRandom } from '../seeded-random';

const SHAPES: Array<VisualShapeConfig['shape']> = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'hexagon',
  'cross',
  'star',
];

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

export function generateMissingPiecePuzzle(
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): MissingPiecePuzzle {
  const rng = new SeededRandom(`${seed}-MISSING_PIECE-${round}-${difficulty}`);

  const matrix: Array<Array<VisualShapeConfig | null>> = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  let ruleExplanation = '';
  const baseColor = rng.pick(COLORS);

  if (difficulty === 'EASY') {
    // 1. Single Progression: Rotations or Dot Counts across shapes
    const shape = rng.pick(['square', 'triangle', 'diamond', 'cross'] as const);
    const rotStep = rng.pick([45, 90]);

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const step = r * 3 + c;
        matrix[r][c] = {
          shape,
          rotation: (step * rotStep) % 360,
          fill: 'solid',
          size: 0.8,
          color: baseColor,
          dotsCount: 0,
        };
      }
    }
    ruleExplanation = `Each cell rotates clockwise by ${rotStep}°.`;
  } else if (difficulty === 'MEDIUM') {
    // 2. Row Shape + Column Rotation / Dot count
    const rowShapes: Array<VisualShapeConfig['shape']> = rng.shuffle([
      'circle',
      'square',
      'triangle',
      'diamond',
    ]).slice(0, 3) as any;

    const rotStep = rng.pick([45, 90]);
    const fills: Array<VisualShapeConfig['fill']> = ['solid', 'striped', 'empty'];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        matrix[r][c] = {
          shape: rowShapes[r],
          rotation: (c * rotStep) % 360,
          fill: fills[c % fills.length],
          size: 0.8,
          color: baseColor,
          dotsCount: c + 1,
        };
      }
    }
    ruleExplanation = `Rows define the base shape; columns rotate by ${rotStep}° and increment internal dots.`;
  } else {
    // HARD: Shape cycles along rows, rotation advances along columns, fill cycles
    const shapeCycle = ['hexagon', 'star', 'diamond'] as const;
    const fills: Array<VisualShapeConfig['fill']> = ['solid', 'dotted', 'striped'];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const sIndex = (r + c) % 3;
        matrix[r][c] = {
          shape: shapeCycle[sIndex],
          rotation: ((r * 90) + (c * 45)) % 360,
          fill: fills[(r * 2 + c) % 3],
          size: 0.8,
          color: baseColor,
          dotsCount: (r + c + 1) % 4,
          innerShape: (r === c ? 'dot' : 'circle') as any,
        };
      }
    }
    ruleExplanation = 'Diagonal shape cycles with compound row-column rotation (+90° per row, +45° per column).';
  }

  // Cell (2,2) is the target piece
  const correctConfig = { ...matrix[2][2]! };
  matrix[2][2] = null; // missing slot

  // Generate 4 distinct candidate options (1 correct + 3 distractors)
  const distractors: VisualShapeConfig[] = [];

  // Distractor 1: Wrong rotation
  distractors.push({
    ...correctConfig,
    rotation: (correctConfig.rotation + 90) % 360,
  });

  // Distractor 2: Wrong shape
  const otherShapes = SHAPES.filter((s) => s !== correctConfig.shape);
  distractors.push({
    ...correctConfig,
    shape: rng.pick(otherShapes),
  });

  // Distractor 3: Wrong fill or dot count
  distractors.push({
    ...correctConfig,
    dotsCount: correctConfig.dotsCount === 0 ? 2 : (correctConfig.dotsCount + 2) % 4,
    fill: correctConfig.fill === 'solid' ? 'empty' : 'solid',
  });

  // Distractor 4: Inverted rotation / different size
  distractors.push({
    ...correctConfig,
    rotation: (correctConfig.rotation + 180) % 360,
    size: 0.6,
  });

  const allCandidates = [correctConfig, ...distractors];
  const shuffledCandidates = rng.shuffle(allCandidates);
  const correctCandidateIndex = shuffledCandidates.findIndex(
    (c) =>
      c.shape === correctConfig.shape &&
      c.rotation === correctConfig.rotation &&
      c.fill === correctConfig.fill &&
      c.dotsCount === correctConfig.dotsCount &&
      c.size === correctConfig.size
  );

  return {
    id: `MP-${difficulty}-R${round}`,
    matrix,
    candidates: shuffledCandidates,
    correctCandidateIndex,
    ruleExplanation,
  };
}
