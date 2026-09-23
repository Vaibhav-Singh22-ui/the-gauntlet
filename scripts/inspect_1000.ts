import fs from 'fs';

const sql = fs.readFileSync('import_questions_1000.sql', 'utf8');
const lines = sql.split('\n');

const questions: any[] = [];
lines.forEach(l => {
  const m = l.match(/values \('([^']+)',\s*'((?:[^']|'')*)',.*?,([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/);
  if (m) {
    questions.push({
      id: m[1],
      level: parseInt(m[3]),
      color: m[4],
      cat: m[5],
      diff: m[6]
    });
  }
});

console.log('Total questions in import_questions_1000.sql:', questions.length);

const byLevel: Record<number, Record<string, number>> = {};
questions.forEach(q => {
  if (!byLevel[q.level]) byLevel[q.level] = {};
  byLevel[q.level][q.color] = (byLevel[q.level][q.color] || 0) + 1;
});

for (let lvl = 1; lvl <= 15; lvl++) {
  const colors = byLevel[lvl] || {};
  const total = Object.values(colors).reduce((a, b) => a + b, 0);
  console.log(`Level ${lvl.toString().padStart(2)}: Total = ${total.toString().padStart(3)} | ` +
    Object.entries(colors).map(([c, count]) => `${c}: ${count}`).join(', '));
}
