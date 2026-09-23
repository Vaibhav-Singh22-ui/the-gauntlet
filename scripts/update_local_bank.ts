import fs from 'fs';

const master: any[] = JSON.parse(fs.readFileSync('master_unique_questions.json', 'utf8'));

const lines: string[] = [
  '// Auto-generated 50 Millionaire Question Bank - Fully Deduplicated & Verified',
  '// Levels 1-3: Easy Curated Tier',
  '// Levels 4-15: Very High Difficulty Tier (Algebra, Geometry, Logic, Probability, Number Theory, Commercial Math)',
  '',
  'export interface BankQuestion {',
  '  id: string;',
  '  external_id: string;',
  '  question_text: string;',
  '  option_a: string;',
  '  option_b: string;',
  '  option_c: string;',
  '  option_d: string;',
  '  correct_option: \'A\' | \'B\' | \'C\' | \'D\';',
  '  hint_text: string;',
  '  level: number;',
  '  color: \'RED\' | \'BLUE\' | \'GREEN\' | \'YELLOW\' | \'PINK\' | \'VIOLET\';',
  '  category: string;',
  '  difficulty: \'EASY\' | \'MEDIUM\' | \'HARD\';',
  '  expected_solve_seconds: number;',
  '  verification_status: \'VERIFIED\' | \'NEEDS_HUMAN_REVIEW\';',
  '  active: boolean;',
  '}',
  '',
  'export const LOCAL_QUESTION_BANK: BankQuestion[] = ['
];

master.forEach((q, idx) => {
  const item: any = {
    id: q.external_id,
    external_id: q.external_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    hint_text: q.hint_text,
    level: q.level,
    color: q.color,
    category: q.category,
    difficulty: q.difficulty,
    expected_solve_seconds: q.expected_solve_seconds,
    verification_status: q.verification_status,
    active: q.active
  };

  lines.push('  ' + JSON.stringify(item, null, 2).split('\n').join('\n  ') + (idx < master.length - 1 ? ',' : ''));
});

lines.push('];');
lines.push('');
lines.push('export function getEligibleQuestions(level: number, color?: string): BankQuestion[] {');
lines.push('  return LOCAL_QUESTION_BANK.filter((q) => {');
lines.push('    if (q.level !== level) return false;');
lines.push('    if (color && q.color !== color) return false;');
lines.push('    if (level <= 3) {');
lines.push('      return q.difficulty === \'EASY\';');
lines.push('    } else {');
lines.push('      return q.difficulty === \'MEDIUM\' || q.difficulty === \'HARD\';');
lines.push('    }');
lines.push('  });');
lines.push('}');
lines.push('');

fs.writeFileSync('src/lib/local-question-bank.ts', lines.join('\n'), 'utf8');
console.log(`Updated src/lib/local-question-bank.ts with ${master.length} unique questions.`);
