import { LOCAL_QUESTION_BANK } from '../src/lib/local-question-bank';

console.log('Total questions in LOCAL_QUESTION_BANK:', LOCAL_QUESTION_BANK.length);

const byLevel: Record<number, number> = {};
const byDiff: Record<string, number> = {};
const byStatus: Record<string, number> = {};

LOCAL_QUESTION_BANK.forEach(q => {
  byLevel[q.level] = (byLevel[q.level] || 0) + 1;
  byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
  byStatus[q.verification_status] = (byStatus[q.verification_status] || 0) + 1;
});

console.log('Levels:', byLevel);
console.log('Difficulties:', byDiff);
console.log('Verification Statuses:', byStatus);
console.log('Level 1 count:', byLevel[1]);
console.log('Level 1 sample:', LOCAL_QUESTION_BANK.filter(q => q.level === 1).slice(0, 5).map(q => ({ id: q.external_id, text: q.question_text, color: q.color })));
