import { LOCAL_QUESTION_BANK } from '../src/lib/local-question-bank';

const uniqueTexts = new Map<string, any>();
const duplicatesMap = new Map<string, string[]>();

LOCAL_QUESTION_BANK.forEach(q => {
  const norm = q.question_text.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!uniqueTexts.has(norm)) {
    uniqueTexts.set(norm, q);
    duplicatesMap.set(norm, [q.external_id]);
  } else {
    duplicatesMap.get(norm)?.push(q.external_id);
  }
});

console.log('Total in LOCAL_QUESTION_BANK:', LOCAL_QUESTION_BANK.length);
console.log('Unique question texts:', uniqueTexts.size);

const byLevelUnique: Record<number, number> = {};
uniqueTexts.forEach(q => {
  byLevelUnique[q.level] = (byLevelUnique[q.level] || 0) + 1;
});
console.log('Unique questions by original assigned level:');
for (let lvl = 1; lvl <= 15; lvl++) {
  console.log(`Level ${lvl.toString().padStart(2)}: ${byLevelUnique[lvl] || 0}`);
}
