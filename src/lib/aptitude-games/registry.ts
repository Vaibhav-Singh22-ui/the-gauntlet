import { AptitudeGameType, GameMetadata } from './types';

export const APTITUDE_GAMES: Record<AptitudeGameType, GameMetadata> = {
  NUMBER_SPRINT: {
    id: 'NUMBER_SPRINT',
    title: 'NUMBER SPRINT',
    tagline: 'Crack the numeric pattern before time expires',
    description:
      'Deduce the missing numbers in rapidly accelerating arithmetic, geometric, polynomial, and alternating number sequences.',
    route: '/aptitude/number-sprint',
    accentColor: '#3b82f6', // Electric Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    skills: ['Number Series', 'Arithmetic Patterns', 'Second Differences', 'Mental Agility'],
    roundsPerGame: 5,
    timeLimit: {
      EASY: 30,
      MEDIUM: 25,
      HARD: 20,
    },
    icon: 'Zap',
  },
  TARGET_24: {
    id: 'TARGET_24',
    title: 'TARGET 24',
    tagline: 'Combine 4 numbers & operations to hit 24',
    description:
      'Construct a valid mathematical expression using each given number exactly once with basic arithmetic and parentheses to reach 24.',
    route: '/aptitude/target-24',
    accentColor: '#10b981', // Emerald Green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    skills: ['Mental Math', 'Operator Precedence', 'Fractional Thinking', 'Combinatorial Search'],
    roundsPerGame: 5,
    timeLimit: {
      EASY: 60,
      MEDIUM: 50,
      HARD: 45,
    },
    icon: 'Target',
  },
  GRID_LOGIC: {
    id: 'GRID_LOGIC',
    title: 'GRID LOGIC',
    tagline: 'Complete the missing cell in the logical matrix',
    description:
      'Decode horizontal and vertical mathematical relationships across 3×3 grids to uncover the hidden value.',
    route: '/aptitude/grid-logic',
    accentColor: '#f59e0b', // Amber Gold
    glowColor: 'rgba(245, 158, 11, 0.4)',
    skills: ['Matrix Logic', 'Invariant Detection', 'Cross Multiplication', 'Spatial Analysis'],
    roundsPerGame: 5,
    timeLimit: {
      EASY: 45,
      MEDIUM: 40,
      HARD: 35,
    },
    icon: 'Grid',
  },
  MISSING_PIECE: {
    id: 'MISSING_PIECE',
    title: 'MISSING PIECE',
    tagline: 'Discover the visual transformation rule',
    description:
      'Non-verbal visual reasoning matrix. Analyze shape rotations, Boolean segment combinations, and concentric element progressions to choose the fitting piece.',
    route: '/aptitude/missing-piece',
    accentColor: '#ec4899', // Hot Pink
    glowColor: 'rgba(236, 72, 153, 0.4)',
    skills: ['Abstract Reasoning', 'Rotational Symmetry', 'Boolean Geometry', 'Pattern Completion'],
    roundsPerGame: 5,
    timeLimit: {
      EASY: 45,
      MEDIUM: 40,
      HARD: 30,
    },
    icon: 'Puzzle',
  },
  ARRANGEMENT_MASTER: {
    id: 'ARRANGEMENT_MASTER',
    title: 'ARRANGEMENT MASTER',
    tagline: 'Order items to satisfy all logical constraints',
    description:
      'Deduce the unique ordering of objects and characters using positional constraints, non-adjacency rules, and relative positioning.',
    route: '/aptitude/arrangement-master',
    accentColor: '#8b5cf6', // Violet Purple
    glowColor: 'rgba(139, 92, 246, 0.4)',
    skills: ['Deductive Reasoning', 'Constraint Satisfaction', 'Linear Ordering', 'Logical Elimination'],
    roundsPerGame: 5,
    timeLimit: {
      EASY: 60,
      MEDIUM: 50,
      HARD: 45,
    },
    icon: 'Layers',
  },
};

export const ALL_GAME_TYPES: AptitudeGameType[] = [
  'NUMBER_SPRINT',
  'TARGET_24',
  'GRID_LOGIC',
  'MISSING_PIECE',
  'ARRANGEMENT_MASTER',
];
