import fs from 'fs';

const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
console.log('Total questions in questions_easy_180.json:', easy180.length);

const byLevel: Record<number, number> = {};
const byColor: Record<string, number> = {};
const byDiff: Record<string, number> = {};

easy180.forEach((q: any) => {
  byLevel[q.level] = (byLevel[q.level] || 0) + 1;
  byColor[q.color] = (byColor[q.color] || 0) + 1;
  byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
});

console.log('Levels:', byLevel);
console.log('Colors:', byColor);
console.log('Difficulties:', byDiff);
console.log('Sample L1:', easy180.slice(0, 3).map((q: any) => ({ id: q.external_id, text: q.question_text, color: q.color, diff: q.difficulty, sub: q.sub_difficulty })));
console.log('Sample L2:', easy180.filter((q: any) => q.level === 2).slice(0, 3).map((q: any) => ({ id: q.external_id, text: q.question_text, color: q.color, diff: q.difficulty, sub: q.sub_difficulty })));
console.log('Sample L3:', easy180.filter((q: any) => q.level === 3).slice(0, 3).map((q: any) => ({ id: q.external_id, text: q.question_text, color: q.color, diff: q.difficulty, sub: q.sub_difficulty })));
