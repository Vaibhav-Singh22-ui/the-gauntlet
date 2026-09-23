import fs from 'fs';
import path from 'path';

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

const COLORS: Array<'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'VIOLET'> = [
  'RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'VIOLET'
];

// Helper to check uniqueness
const seenTexts = new Set<string>();
function normalize(t: string): string {
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 1. Load existing easy questions for Levels 1-3
const easy180Raw: any[] = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));

// 2. Load seed 180 easy questions
const seedSql = fs.readFileSync('02_seed_50_millionaire_180_easy.sql', 'utf8');
const seedRows: any[] = [];
for (const line of seedSql.split('\n')) {
  const m = line.match(/\('(MME180_\d+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*(\d+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/);
  if (m) {
    seedRows.push({
      external_id: m[1],
      question_text: m[2].replace(/''/g, "'"),
      option_a: m[3].replace(/''/g, "'"),
      option_b: m[4].replace(/''/g, "'"),
      option_c: m[5].replace(/''/g, "'"),
      option_d: m[6].replace(/''/g, "'"),
      correct_option: m[7] as 'A' | 'B' | 'C' | 'D',
      hint_text: m[8].replace(/''/g, "'"),
      level: parseInt(m[9]),
      color: m[10] as any,
      category: m[11].replace(/''/g, "'"),
      difficulty: 'EASY',
      expected_solve_seconds: 20,
      verification_status: 'VERIFIED' as const,
      active: true,
      source_type: 'CURATED_EASY_SEED',
      source_reference: `Level ${m[9]} 50 Millionaire Seed`
    });
  }
}

// 3. Load non-duplicate questions from import_questions_1000.sql
const sql1000 = fs.readFileSync('import_questions_1000.sql', 'utf8');
const old1000Unique: any[] = [];
const oldSeen = new Set<string>();

for (const line of sql1000.split('\n')) {
  const m = line.match(/values \('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',\s*([0-9]+)/);
  if (m) {
    const text = m[2].replace(/''/g, "'").trim();
    const norm = normalize(text);
    if (!oldSeen.has(norm)) {
      oldSeen.add(norm);
      old1000Unique.push({
        external_id: m[1],
        question_text: text,
        option_a: m[3].replace(/''/g, "'").trim(),
        option_b: m[4].replace(/''/g, "'").trim(),
        option_c: m[5].replace(/''/g, "'").trim(),
        option_d: m[6].replace(/''/g, "'").trim(),
        correct_option: m[7] as 'A' | 'B' | 'C' | 'D',
        hint_text: m[8].replace(/''/g, "'").trim(),
        level: parseInt(m[9]),
        color: m[10] as any,
        category: m[11].replace(/''/g, "'").trim(),
        difficulty: parseInt(m[9]) <= 3 ? 'EASY' : 'HARD',
        expected_solve_seconds: parseInt(m[13]) || 45,
        verification_status: 'VERIFIED' as const,
        active: true,
        source_type: 'MASTER_1000_UNIQUE',
        source_reference: `Original Unique Question`
      });
    }
  }
}

console.log(`Loaded ${easy180Raw.length} from questions_easy_180.json`);
console.log(`Loaded ${seedRows.length} from 02_seed_50_millionaire_180_easy.sql`);
console.log(`Loaded ${old1000Unique.length} distinct questions from import_questions_1000.sql`);

export { easy180Raw, seedRows, old1000Unique, COLORS, normalize };
