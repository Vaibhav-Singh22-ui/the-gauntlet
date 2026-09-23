import fs from 'fs';
import path from 'path';
import { easy180Raw, seedRows, old1000Unique, COLORS, normalize } from './load_base_questions';

export interface FinalQuestion {
  external_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  hint_text: string;
  level: number;
  color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'VIOLET';
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expected_solve_seconds: number;
  verification_status: 'VERIFIED';
  active: boolean;
  source_type: string;
  source_reference: string;
}

const masterQuestions: FinalQuestion[] = [];
const seenTexts = new Set<string>();

function addQuestion(q: FinalQuestion): boolean {
  const norm = normalize(q.question_text);
  if (seenTexts.has(norm)) {
    return false;
  }
  seenTexts.add(norm);
  masterQuestions.push(q);
  return true;
}

// =================================================================
// STEP 1: ADD ALL 180 EASY QUESTIONS (LEVELS 1-3)
// =================================================================
console.log('Adding 180 curated easy questions...');
for (const q of easy180Raw) {
  addQuestion({
    external_id: q.external_id,
    question_text: q.question_text.trim(),
    option_a: q.option_a.trim(),
    option_b: q.option_b.trim(),
    option_c: q.option_c.trim(),
    option_d: q.option_d.trim(),
    correct_option: q.correct_option,
    hint_text: q.hint_text.trim(),
    level: q.level,
    color: q.color,
    category: q.category || 'Arithmetic',
    difficulty: 'EASY',
    expected_solve_seconds: 20,
    verification_status: 'VERIFIED',
    active: true,
    source_type: 'EASY_180_JSON',
    source_reference: `Level ${q.level} Easy Pack`
  });
}

// =================================================================
// STEP 2: ADD ALL 180 SEED EASY QUESTIONS (LEVELS 1-3)
// =================================================================
console.log('Adding 180 seed easy questions...');
for (const q of seedRows) {
  addQuestion({
    ...q,
    difficulty: 'EASY'
  });
}

console.log(`Current master count after L1-3 easy import: ${masterQuestions.length}`);

// =================================================================
// STEP 3: ADD OLD UNIQUE QUESTIONS THAT ARE NOT IN L1-3
// =================================================================
console.log('Adding original high-quality unique questions for L4-15...');
for (const q of old1000Unique) {
  if (q.level >= 4) {
    addQuestion({
      ...q,
      difficulty: 'HARD',
      expected_solve_seconds: 45
    });
  }
}
console.log(`Current master count after adding original L4-15: ${masterQuestions.length}`);

// Save partial state and check counts by level & color
const byLevelColor: Record<number, Record<string, number>> = {};
for (let lvl = 1; lvl <= 15; lvl++) {
  byLevelColor[lvl] = {};
  for (const c of COLORS) byLevelColor[lvl][c] = 0;
}

for (const q of masterQuestions) {
  if (byLevelColor[q.level]) {
    byLevelColor[q.level][q.color] = (byLevelColor[q.level][q.color] || 0) + 1;
  }
}

console.log('Current Level & Color Distribution:');
for (let lvl = 1; lvl <= 15; lvl++) {
  const tot = Object.values(byLevelColor[lvl]).reduce((a, b) => a + b, 0);
  console.log(`Level ${lvl.toString().padStart(2)}: Total = ${tot.toString().padStart(3)} | ` +
    COLORS.map(c => `${c}: ${byLevelColor[lvl][c]}`).join(', '));
}

export { masterQuestions, addQuestion, byLevelColor, seenTexts };
