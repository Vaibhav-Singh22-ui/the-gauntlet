import fs from 'fs';

const sql = fs.readFileSync('02_seed_50_millionaire_180_easy.sql', 'utf8');
const lines = sql.split('\n');

const seedRows: any[] = [];
lines.forEach((line, idx) => {
  // ('MME180_001', 'What is 15% of 200?', '20', '25', '30', '35', 'C', 'Convert 15% to a fraction of 100.', 1, 'RED', 'Mathematics', 'VERY_VERY_EASY', 20, 'NEEDS_HUMAN_REVIEW', false, 'original_generated_seed', '50_MILLIONAIRE_180_EASY_SEED'),
  const m = line.match(/\('(MME180_\d+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*(\d+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/);
  if (m) {
    seedRows.push({
      id: m[1],
      text: m[2].replace(/''/g, "'"),
      a: m[3].replace(/''/g, "'"),
      b: m[4].replace(/''/g, "'"),
      c: m[5].replace(/''/g, "'"),
      d: m[6].replace(/''/g, "'"),
      correct: m[7],
      hint: m[8].replace(/''/g, "'"),
      level: parseInt(m[9]),
      color: m[10],
      cat: m[11].replace(/''/g, "'"),
      diff: m[12]
    });
  }
});

console.log('Parsed seed rows from 02_seed_50_millionaire_180_easy.sql:', seedRows.length);
const byLvl: Record<number, number> = {};
const byDiff: Record<string, number> = {};
seedRows.forEach(r => {
  byLvl[r.level] = (byLvl[r.level] || 0) + 1;
  byDiff[r.diff] = (byDiff[r.diff] || 0) + 1;
});
console.log('Levels:', byLvl);
console.log('Difficulties:', byDiff);
