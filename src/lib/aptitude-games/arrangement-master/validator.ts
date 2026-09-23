import { ArrangementConstraint, ArrangementPuzzle } from '../types';

export type ConstraintStatus = 'SATISFIED' | 'VIOLATED' | 'PENDING';

export interface ConstraintEvaluationResult {
  constraintId: string;
  description: string;
  status: ConstraintStatus;
}

/**
 * Checks a single constraint against the current arrangement of entity IDs
 */
export function evaluateConstraint(
  constraint: ArrangementConstraint,
  currentArrangement: string[] = []
): ConstraintStatus {
  if (!constraint || !currentArrangement || !Array.isArray(currentArrangement)) {
    return 'PENDING';
  }

  const posA = currentArrangement.indexOf(constraint.entityA);
  const posB = constraint.entityB ? currentArrangement.indexOf(constraint.entityB) : -1;

  if (posA === -1) return 'PENDING';

  switch (constraint.type) {
    case 'BEFORE':
      if (posB === -1) return 'PENDING';
      return posA < posB ? 'SATISFIED' : 'VIOLATED';

    case 'AFTER':
      if (posB === -1) return 'PENDING';
      return posA > posB ? 'SATISFIED' : 'VIOLATED';

    case 'IMMEDIATELY_BEFORE':
      if (posB === -1) return 'PENDING';
      return posA === posB - 1 ? 'SATISFIED' : 'VIOLATED';

    case 'NOT_ADJACENT':
      if (posB === -1) return 'PENDING';
      return Math.abs(posA - posB) > 1 ? 'SATISFIED' : 'VIOLATED';

    case 'AT_POSITION':
      if (constraint.position === undefined) return 'PENDING';
      return posA === constraint.position - 1 ? 'SATISFIED' : 'VIOLATED';

    case 'AT_ENDPOINT':
      return posA === 0 || posA === currentArrangement.length - 1 ? 'SATISFIED' : 'VIOLATED';

    default:
      return 'PENDING';
  }
}

/**
 * Evaluates all constraints in real-time for live UI feedback
 */
export function evaluateAllConstraints(
  puzzle: ArrangementPuzzle,
  currentArrangement: string[] = []
): ConstraintEvaluationResult[] {
  if (!puzzle || !puzzle.constraints || !Array.isArray(puzzle.constraints)) {
    return [];
  }
  const safeArrangement = Array.isArray(currentArrangement) ? currentArrangement : [];
  return puzzle.constraints.map((c) => ({
    constraintId: c.id,
    description: c.description,
    status: evaluateConstraint(c, safeArrangement),
  }));
}

/**
 * Validates a final submitted arrangement
 */
export function validateArrangementAnswer(
  puzzle: ArrangementPuzzle,
  userArrangement: string[]
): { correct: boolean; explanation: string; evaluations: ConstraintEvaluationResult[] } {
  if (!Array.isArray(userArrangement) || userArrangement.length !== puzzle.entities.length) {
    return {
      correct: false,
      explanation: `Arrangement must include all ${puzzle.entities.length} items.`,
      evaluations: [],
    };
  }

  const evaluations = evaluateAllConstraints(puzzle, userArrangement);
  const allSatisfied = evaluations.every((e) => e.status === 'SATISFIED');

  return {
    correct: allSatisfied,
    explanation: allSatisfied
      ? 'Perfect arrangement! All constraints satisfied.'
      : 'One or more constraints are not satisfied by your arrangement.',
    evaluations,
  };
}
