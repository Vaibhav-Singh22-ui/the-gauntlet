/**
 * Aptitude Games — Core Types & Data Contracts
 * Isolated from 50 Millionaire game types.
 */

export type AptitudeGameType =
  | 'NUMBER_SPRINT'
  | 'TARGET_24'
  | 'GRID_LOGIC'
  | 'MISSING_PIECE'
  | 'ARRANGEMENT_MASTER';

export type AptitudeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AptitudeSessionStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'TIME_OUT';

export interface AptitudeSession {
  id: string;
  gameType: AptitudeGameType;
  difficulty: AptitudeDifficulty;
  round: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  timeLimitSeconds: number;
  timeRemaining: number;
  attempts: number;
  status: AptitudeSessionStatus;
  seed: string;
  startedAt: string;
  completedAt?: string;
}

// -------------------------------------------------------------
// GAME 1: NUMBER SPRINT
// -------------------------------------------------------------
export interface NumberSprintPuzzle {
  id: string;
  sequence: Array<number | null>;
  missingIndex: number;
  correctAnswer: number;
  patternName: string;
  ruleExplanation: string;
  options?: number[]; // optional helper suggestions if needed
}

// -------------------------------------------------------------
// GAME 2: TARGET 24
// -------------------------------------------------------------
export interface Target24Puzzle {
  id: string;
  numbers: number[];
  target: number;
  knownSolutions: string[];
}

// -------------------------------------------------------------
// GAME 3: GRID LOGIC
// -------------------------------------------------------------
export interface GridLogicPuzzle {
  id: string;
  gridSize: 3; // 3x3
  grid: Array<Array<number | null>>;
  targetRow: number;
  targetCol: number;
  correctAnswer: number;
  ruleDescription: string;
}

// -------------------------------------------------------------
// GAME 4: MISSING PIECE (Visual / Non-verbal reasoning)
// -------------------------------------------------------------
export interface VisualShapeConfig {
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'hexagon';
  rotation: number; // degrees: 0, 45, 90, 135, 180, 225, 270, 315
  fill: 'solid' | 'empty' | 'striped' | 'dotted';
  size: number; // scale 0.5 to 1.0
  color: string;
  dotsCount: number;
  innerShape?: 'circle' | 'square' | 'dot' | 'none';
  gridLines?: boolean;
}

export interface MissingPiecePuzzle {
  id: string;
  matrix: Array<Array<VisualShapeConfig | null>>; // 3x3 matrix where (2,2) is missing
  candidates: VisualShapeConfig[]; // 4 to 6 candidate pieces
  correctCandidateIndex: number;
  ruleExplanation: string;
}

// -------------------------------------------------------------
// GAME 5: ARRANGEMENT MASTER (Logical ordering & constraints)
// -------------------------------------------------------------
export interface ArrangementEntity {
  id: string;
  label: string;
  color: string;
  iconName?: string;
}

export type ConstraintType =
  | 'BEFORE'             // A is anywhere before B
  | 'IMMEDIATELY_BEFORE' // A is directly before B
  | 'NOT_ADJACENT'       // A cannot touch B
  | 'AT_POSITION'        // A is at exact index (1-based)
  | 'AT_ENDPOINT'        // A is at position 1 or last
  | 'AFTER';             // A is anywhere after B

export interface ArrangementConstraint {
  id: string;
  description: string;
  type: ConstraintType;
  entityA: string;
  entityB?: string;
  position?: number;
}

export interface ArrangementPuzzle {
  id: string;
  entities: ArrangementEntity[];
  constraints: ArrangementConstraint[];
  targetSolution: string[]; // array of entity ids in order
}

// -------------------------------------------------------------
// REGISTRY & METADATA
// -------------------------------------------------------------
export interface GameMetadata {
  id: AptitudeGameType;
  title: string;
  tagline: string;
  description: string;
  route: string;
  accentColor: string; // Tailwind color class or hex
  glowColor: string;
  skills: string[];
  roundsPerGame: number;
  timeLimit: Record<AptitudeDifficulty, number>; // in seconds
  icon: string;
}

// Validation Request & Response Contracts
export interface ValidateAnswerPayload {
  sessionId: string;
  gameType: AptitudeGameType;
  difficulty: AptitudeDifficulty;
  round: number;
  seed: string;
  answer: any; // number | string (expression) | number (index) | string[] (permutation)
  timeRemainingSeconds: number;
}

export interface ValidationResponse {
  success: boolean;
  correct: boolean;
  explanation?: string;
  scoreEarned: number;
  totalScore: number;
  streak: number;
  isGameComplete: boolean;
  nextRound?: number;
  nextPuzzle?: any;
  error?: string;
}
