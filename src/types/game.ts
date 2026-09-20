export type WheelColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'VIOLET';

export type GameStatus =
  | 'CREATED'
  | 'LEVEL_INTRO'
  | 'WHEEL'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_SUBMITTED'
  | 'CORRECT'
  | 'RISK_DECISION'
  | 'GAME_OVER'
  | 'COMPLETED';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type VerificationStatus = 'NEEDS_HUMAN_REVIEW' | 'VERIFIED' | 'REJECTED';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface GameSession {
  id: string;
  operator_id?: string | null;
  status: GameStatus;
  current_level: number;
  current_reward: number;
  lifeline_hint_available: boolean;
  lifeline_fifty_fifty_available: boolean;
  started_at: string;
  ended_at?: string | null;
  final_reward: number;
  final_level: number;
  result?: 'WON' | 'LOST_WRONG' | 'LOST_TIMEOUT' | 'ABANDONED' | null;
}

export interface ActiveQuestionData {
  session_question_id: string;
  level: number;
  selected_color: WheelColor;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  presented_at: string;
  hint_available: boolean;
  fifty_fifty_available: boolean;
  current_reward: number;
  next_reward: number;
  removed_options?: AnswerOption[] | null;
  lifeline_hint_used?: boolean;
}

export interface QuestionRecord {
  id: string;
  external_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: AnswerOption; // Only in operator view
  hint_text: string;
  level: number;
  color: WheelColor;
  category: string;
  difficulty: QuestionDifficulty;
  expected_solve_seconds: number;
  verification_status: VerificationStatus;
  active: boolean;
  source_type?: string;
  source_reference?: string;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface AnswerSubmissionResult {
  success: boolean;
  result: 'CORRECT' | 'WRONG' | 'TIMEOUT';
  correct: boolean;
  is_timeout: boolean;
  correct_option: AnswerOption;
  status: GameStatus;
  current_reward: number;
  current_level: number;
  error?: string;
}

export const WHEEL_COLORS_CONFIG: Record<WheelColor, { name: string; hex: string; bgClass: string; borderClass: string; textClass: string }> = {
  RED: { name: 'Red', hex: '#EF4444', bgClass: 'bg-red-600', borderClass: 'border-red-500', textClass: 'text-red-400' },
  BLUE: { name: 'Blue', hex: '#3B82F6', bgClass: 'bg-blue-600', borderClass: 'border-blue-500', textClass: 'text-blue-400' },
  GREEN: { name: 'Green', hex: '#10B981', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-500', textClass: 'text-emerald-400' },
  YELLOW: { name: 'Yellow', hex: '#EAB308', bgClass: 'bg-yellow-500', borderClass: 'border-yellow-400', textClass: 'text-yellow-400' },
  PINK: { name: 'Pink', hex: '#EC4899', bgClass: 'bg-pink-600', borderClass: 'border-pink-500', textClass: 'text-pink-400' },
  VIOLET: { name: 'Violet', hex: '#8B5CF6', bgClass: 'bg-violet-600', borderClass: 'border-violet-500', textClass: 'text-violet-400' },
};

export const REWARD_LADDER = [
  { level: 1, reward: 10 },
  { level: 2, reward: 20 },
  { level: 3, reward: 30 },
  { level: 4, reward: 40 },
  { level: 5, reward: 50 },
  { level: 6, reward: 60 },
  { level: 7, reward: 70 },
  { level: 8, reward: 80 },
  { level: 9, reward: 90 },
  { level: 10, reward: 100 },
  { level: 11, reward: 110 },
  { level: 12, reward: 120 },
  { level: 13, reward: 130 },
  { level: 14, reward: 140 },
  { level: 15, reward: 150 },
];
