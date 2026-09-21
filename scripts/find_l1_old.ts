import fs from 'fs';

const sql = fs.readFileSync('import_questions_1000.sql', 'utf8');
const lines = sql.split('\n');

const l1OldIds: string[] = [];
lines.forEach(line => {
  // e.g. values ('Q0018',..., 1, 'PINK',...)
  const match = line.match(/values \('([^']+)',.*?,([0-9]+),'([A-Z]+)',/);
  if (match && parseInt(match[2]) === 1) {
    l1OldIds.push(match[1]);
  }
});

console.log('Old Level 1 question IDs in import_questions_1000.sql:', l1OldIds);
