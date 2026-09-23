import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function countExisting() {
  const sql1000 = fs.readFileSync('import_questions_1000.sql', 'utf8');
  const m1000 = [...sql1000.matchAll(/values \('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/g)];
  
  console.log(`Found ${m1000.length} questions in import_questions_1000.sql`);
  
  let totalDuplicates = 0;
  let totalValid = 0;
  const BATCH = 100;

  for (let i = 0; i < m1000.length; i += BATCH) {
    const slice = m1000.slice(i, i + BATCH).map(m => ({
      external_id: m[1],
      question_text: m[2],
      option_a: m[3],
      option_b: m[4],
      option_c: m[5],
      option_d: m[6],
      correct_option: m[7],
      hint_text: m[8],
      level: parseInt(m[9]),
      color: m[10],
      category: m[11],
      difficulty: m[12] === 'VERY_VERY_EASY' || m[12] === 'VERY_EASY' ? 'EASY' : m[12]
    }));

    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: slice,
      p_dry_run: true
    });

    if (error) {
      console.error(`Error in batch ${i}:`, error);
    } else {
      totalDuplicates += (data as any)?.duplicates || 0;
      totalValid += (data as any)?.valid || 0;
    }
  }

  console.log(`Out of ${m1000.length} from import_questions_1000.sql: valid=${totalValid}, duplicates (already in DB)=${totalDuplicates}`);
}

countExisting();
