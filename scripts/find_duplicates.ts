import { LOCAL_QUESTION_BANK } from '../src/lib/local-question-bank';
import fs from 'fs';

console.log('--- LOCAL_QUESTION_BANK ANALYSIS ---');
const qTextCounts: Record<string, string[]> = {};
LOCAL_QUESTION_BANK.forEach(q => {
  const t = q.question_text.trim().toLowerCase();
  if (!qTextCounts[t]) qTextCounts[t] = [];
  qTextCounts[t].push(`${q.external_id} (L${q.level}, ${q.color})`);
});

const duplicates = Object.entries(qTextCounts).filter(([_, ids]) => ids.length > 1);
console.log(`Total questions: ${LOCAL_QUESTION_BANK.length}`);
console.log(`Unique question texts: ${Object.keys(qTextCounts).length}`);
console.log(`Duplicate question texts: ${duplicates.length}`);

console.log('\nTop 10 duplicate questions:');
duplicates.sort((a, b) => b[1].length - a[1].length).slice(0, 10).forEach(([text, ids]) => {
  console.log(`- Repeated ${ids.length} times: "${text.slice(0, 60)}..."`);
  console.log(`  Occurrences: ${ids.join(', ')}`);
});
