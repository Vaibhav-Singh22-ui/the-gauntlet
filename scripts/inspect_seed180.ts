import fs from 'fs';

const sql = fs.readFileSync('02_seed_50_millionaire_180_easy.sql', 'utf8');
const lines = sql.split('\n');

const questions: any[] = [];
lines.forEach(l => {
  const m = l.match(/\('([^']+)',\s*'((?:[^']|'')*)',.*?,([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/);
  if (m) {
    questions.push({
      id: m[1],
      text: m[2],
      level: parseInt(m[3]),
      color: m[4],
      cat: m[5],
      diff: m[6]
    });
  }
});

console.log('Total questions in 02_seed_50_millionaire_180_easy.sql:', questions.length);

const byLevel: Record<number, Record<string, number>> = {};
questions.forEach(q => {
  if (!byLevel[q.level]) byLevel[q.level] = {};
  byLevel[q.level][q.color] = (byLevel[q.level][q.color] || 0) + 1;
});

for (let lvl = 1; lvl <= 3; lvl++) {
  const colors = byLevel[lvl] || {};
  const total = Object.values(colors).reduce((a, b) => a + b, 0);
  console.log(`Level ${lvl}: Total = ${total} | ` +
    Object.entries(colors).map(([c, count]) => `${c}: ${count}`).join(', '));
}
console.log('Sample question:', questions[0]);
