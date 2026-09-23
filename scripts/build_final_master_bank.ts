import fs from 'fs';
import path from 'path';
import { easy180Raw, seedRows, old1000Unique, COLORS, normalize, FinalQuestion } from './load_base_questions';

// 1. Load the 720 hard questions
const hard720: any[] = JSON.parse(fs.readFileSync('hard_questions_720.json', 'utf8'));
console.log(`Loaded ${hard720.length} hard questions for levels 4-15`);

const seenTexts = new Set<string>();
const masterList: FinalQuestion[] = [];

// Helper to validate and add question
function tryAdd(q: any, sourceTag: string): boolean {
  const norm = normalize(q.question_text);
  if (seenTexts.has(norm)) return false;

  const opts = [
    String(q.option_a).trim(),
    String(q.option_b).trim(),
    String(q.option_c).trim(),
    String(q.option_d).trim()
  ];
  if (new Set(opts).size !== 4) {
    return false; // skip duplicate options
  }

  const corr = String(q.correct_option).trim().toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(corr)) return false;

  const lvl = parseInt(q.level);
  if (isNaN(lvl) || lvl < 1 || lvl > 15) return false;

  const col = String(q.color).trim().toUpperCase();
  if (!COLORS.includes(col as any)) return false;

  seenTexts.add(norm);
  masterList.push({
    external_id: q.external_id || '',
    question_text: String(q.question_text).trim(),
    option_a: opts[0],
    option_b: opts[1],
    option_c: opts[2],
    option_d: opts[3],
    correct_option: corr as any,
    hint_text: String(q.hint_text || '').trim() || 'Analyze carefully.',
    level: lvl,
    color: col as any,
    category: String(q.category || 'Quantitative').trim(),
    difficulty: lvl <= 3 ? 'EASY' : 'HARD',
    expected_solve_seconds: parseInt(q.expected_solve_seconds) || (lvl <= 3 ? 30 : 60),
    verification_status: 'VERIFIED',
    active: true,
    source_type: sourceTag,
    source_reference: q.source_reference || `Level ${lvl} ${col}`
  });
  return true;
}

// First, add all 720 verified hard questions (Levels 4-15)
for (const q of hard720) {
  tryAdd(q, 'HIGH_DIFFICULTY_MASTER_BANK');
}
console.log(`Added hard questions. Master list now: ${masterList.length}`);

// Next, add easy questions for Levels 1-3 from questions_easy_180.json
for (const q of easy180Raw) {
  if (parseInt(q.level) <= 3) {
    tryAdd(q, 'EASY_180_JSON');
  }
}
console.log(`Added easy180 questions. Master list now: ${masterList.length}`);

// Next, add easy questions from 02_seed_50_millionaire_180_easy.sql
for (const q of seedRows) {
  if (parseInt(q.level) <= 3) {
    tryAdd(q, 'EASY_SEED_SQL');
  }
}
console.log(`Added seedRows questions. Master list now: ${masterList.length}`);

// Next, add any unique easy questions from old 1000
for (const q of old1000Unique) {
  if (parseInt(q.level) <= 3) {
    tryAdd(q, 'ORIGINAL_UNIQUE_EASY');
  }
}
console.log(`Added old unique easy questions. Master list now: ${masterList.length}`);

// Re-assign canonical external_ids: Q0001, Q0002, ..., Q1080
// We sort by level (1 to 15), then by color, so the bank is organized logically
const colorOrder: Record<string, number> = {
  RED: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
  PINK: 4,
  VIOLET: 5
};

masterList.sort((a, b) => {
  if (a.level !== b.level) return a.level - b.level;
  if (colorOrder[a.color] !== colorOrder[b.color]) {
    return colorOrder[a.color] - colorOrder[b.color];
  }
  return a.question_text.localeCompare(b.question_text);
});

masterList.forEach((q, idx) => {
  const num = idx + 1;
  q.external_id = `Q${String(num).padStart(4, '0')}`;
});

// Distribution stats
const byLevel: Record<number, Record<string, number>> = {};
for (const q of masterList) {
  if (!byLevel[q.level]) byLevel[q.level] = {};
  byLevel[q.level][q.color] = (byLevel[q.level][q.color] || 0) + 1;
}

console.log('\n=== FINAL MASTER BANK POOL DISTRIBUTION ===');
for (let lvl = 1; lvl <= 15; lvl++) {
  const cols = byLevel[lvl] || {};
  const total = Object.values(cols).reduce((a, b) => a + b, 0);
  const row = COLORS.map(c => `${c}: ${cols[c] || 0}`).join(', ');
  console.log(`Level ${String(lvl).padStart(2, ' ')}: Total = ${String(total).padStart(3, ' ')} | ${row}`);
}

console.log(`\nTotal questions in master bank: ${masterList.length}`);
console.log(`Total unique question texts: ${new Set(masterList.map(q => normalize(q.question_text))).size}`);

fs.writeFileSync('master_unique_questions.json', JSON.stringify(masterList, null, 2), 'utf8');
console.log('Saved master_unique_questions.json successfully!');
