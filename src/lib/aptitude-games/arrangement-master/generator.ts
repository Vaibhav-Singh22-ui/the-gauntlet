import {
  AptitudeDifficulty,
  ArrangementConstraint,
  ArrangementEntity,
  ArrangementPuzzle,
} from '../types';
import { SeededRandom } from '../seeded-random';

const ENTITY_CATALOG: ArrangementEntity[] = [
  { id: 'crimson', label: 'Crimson', color: '#ef4444', iconName: 'Flame' },
  { id: 'amber', label: 'Amber', color: '#f59e0b', iconName: 'Sun' },
  { id: 'emerald', label: 'Emerald', color: '#10b981', iconName: 'Gem' },
  { id: 'sapphire', label: 'Sapphire', color: '#3b82f6', iconName: 'Shield' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6', iconName: 'Sparkles' },
  { id: 'cyan', label: 'Cyan', color: '#06b6d4', iconName: 'Zap' },
  { id: 'silver', label: 'Silver', color: '#94a3b8', iconName: 'Moon' },
];

export function generateArrangementPuzzle(
  difficulty: AptitudeDifficulty,
  seed: string,
  round: number
): ArrangementPuzzle {
  const rng = new SeededRandom(`${seed}-ARRANGEMENT_MASTER-${round}-${difficulty}`);

  const entityCount = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 6 : 7;
  const entities = rng.shuffle(ENTITY_CATALOG).slice(0, entityCount);

  // Generate random target permutation
  const targetSolution = rng.shuffle(entities.map((e) => e.id));

  // Build constraints that are true for targetSolution
  const constraints: ArrangementConstraint[] = [];

  const getPos = (id: string) => targetSolution.indexOf(id);

  // 1. Endpoint or exact position constraint
  if (difficulty === 'EASY' || difficulty === 'MEDIUM') {
    const endEntity = rng.pick(entities);
    const pos = getPos(endEntity.id);
    if (pos === 0 || pos === entityCount - 1) {
      constraints.push({
        id: 'c-end',
        type: 'AT_ENDPOINT',
        entityA: endEntity.id,
        description: `${endEntity.label} must be at one of the outer endpoints (first or last).`,
      });
    } else {
      constraints.push({
        id: 'c-pos',
        type: 'AT_POSITION',
        entityA: endEntity.id,
        position: pos + 1,
        description: `${endEntity.label} must occupy Slot #${pos + 1}.`,
      });
    }
  }

  // 2. Relative "BEFORE" constraints
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < targetSolution.length; i++) {
    for (let j = i + 1; j < targetSolution.length; j++) {
      pairs.push([targetSolution[i], targetSolution[j]]);
    }
  }

  const shuffledPairs = rng.shuffle(pairs);
  const beforePair = shuffledPairs[0];
  const aLabel = entities.find((e) => e.id === beforePair[0])!.label;
  const bLabel = entities.find((e) => e.id === beforePair[1])!.label;

  constraints.push({
    id: 'c-before',
    type: 'BEFORE',
    entityA: beforePair[0],
    entityB: beforePair[1],
    description: `${aLabel} must be positioned somewhere to the left of ${bLabel}.`,
  });

  // 3. Immediately before or adjacent constraint
  for (let i = 0; i < targetSolution.length - 1; i++) {
    const p1 = targetSolution[i];
    const p2 = targetSolution[i + 1];
    if (p1 !== beforePair[0] || p2 !== beforePair[1]) {
      const l1 = entities.find((e) => e.id === p1)!.label;
      const l2 = entities.find((e) => e.id === p2)!.label;
      constraints.push({
        id: 'c-adj',
        type: 'IMMEDIATELY_BEFORE',
        entityA: p1,
        entityB: p2,
        description: `${l1} must be placed immediately to the left of ${l2}.`,
      });
      break;
    }
  }

  // 4. Non-adjacency constraint
  const nonAdjacentPairs: Array<[string, string]> = [];
  for (let i = 0; i < targetSolution.length; i++) {
    for (let j = 0; j < targetSolution.length; j++) {
      if (Math.abs(i - j) > 1) {
        nonAdjacentPairs.push([targetSolution[i], targetSolution[j]]);
      }
    }
  }

  if (nonAdjacentPairs.length > 0) {
    const nap = rng.pick(nonAdjacentPairs);
    const n1 = entities.find((e) => e.id === nap[0])!.label;
    const n2 = entities.find((e) => e.id === nap[1])!.label;
    constraints.push({
      id: 'c-not-adj',
      type: 'NOT_ADJACENT',
      entityA: nap[0],
      entityB: nap[1],
      description: `${n1} cannot be directly adjacent to ${n2}.`,
    });
  }

  // 5. Additional relative rule for Medium/Hard
  if (difficulty === 'HARD' && shuffledPairs.length > 1) {
    const secondPair = shuffledPairs[1];
    const lA = entities.find((e) => e.id === secondPair[0])!.label;
    const lB = entities.find((e) => e.id === secondPair[1])!.label;
    constraints.push({
      id: 'c-before-2',
      type: 'BEFORE',
      entityA: secondPair[0],
      entityB: secondPair[1],
      description: `${lA} must be somewhere to the left of ${lB}.`,
    });
  }

  return {
    id: `AM-${difficulty}-R${round}`,
    entities,
    constraints,
    targetSolution,
  };
}
