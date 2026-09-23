import { LOCAL_QUESTION_BANK } from '../src/lib/local-question-bank';

const levelColorMap: Record<number, Record<string, number>> = {};

LOCAL_QUESTION_BANK.forEach(q => {
  if (!levelColorMap[q.level]) levelColorMap[q.level] = {};
  levelColorMap[q.level][q.color] = (levelColorMap[q.level][q.color] || 0) + 1;
});

console.log('--- LOCAL QUESTION BANK POOLS BY LEVEL & COLOR ---');
for (let lvl = 1; lvl <= 15; lvl++) {
  const colors = levelColorMap[lvl] || {};
  const total = Object.values(colors).reduce((a, b) => a + b, 0);
  console.log(`Level ${lvl.toString().padStart(2)}: Total = ${total.toString().padStart(3)} | ` +
    Object.entries(colors).map(([c, count]) => `${c}: ${count}`).join(', '));
}
