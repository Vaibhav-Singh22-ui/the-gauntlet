import fs from 'fs';

// 1. inspect questions_easy_180.json
const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
const easyTexts = new Set(easy180.map((q: any) => q.question_text.trim().toLowerCase()));
console.log('questions_easy_180.json total:', easy180.length, 'unique texts:', easyTexts.size);

// 2. inspect 02_seed_50_millionaire_180_easy.sql
const seedSql = fs.readFileSync('02_seed_50_millionaire_180_easy.sql', 'utf8');
const seedMatches = [...seedSql.matchAll(/\('(MME180_\d+)',\s*'((?:[^']|'')*)'/g)];
console.log('02_seed_50_millionaire_180_easy.sql matches:', seedMatches.length);
const seedTexts = new Set(seedMatches.map(m => m[2].replace(/''/g, "'").trim().toLowerCase()));
console.log('02_seed unique texts:', seedTexts.size);

// Check overlap between easy180 and seed180
let overlap = 0;
seedTexts.forEach(t => { if (easyTexts.has(t)) overlap++; });
console.log('Overlap between easy180 and seed180:', overlap);

// 3. inspect 1000 sql
const sql1000 = fs.readFileSync('import_questions_1000.sql', 'utf8');
const m1000 = [...sql1000.matchAll(/values \('([^']+)',\s*'((?:[^']|'')*)'/g)];
console.log('import_questions_1000.sql matches:', m1000.length);
const texts1000 = new Set(m1000.map(m => m[2].replace(/''/g, "'").trim().toLowerCase()));
console.log('import_questions_1000 unique texts:', texts1000.size);
