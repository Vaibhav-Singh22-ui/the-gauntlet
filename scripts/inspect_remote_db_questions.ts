import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function checkRemote() {
  const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
  const batch1 = easy180.slice(0, 50).map((q: any) => ({
    ...q,
    difficulty: 'EASY'
  }));

  const { data: d1 } = await supabase.rpc('fn_import_questions', {
    p_questions: batch1,
    p_dry_run: true
  });
  console.log('Easy 180 (first 50) dry-run duplicates in DB:', (d1 as any)?.duplicates);

  // Check 50 from 1000 sql
  const sql1000 = fs.readFileSync('import_questions_1000.sql', 'utf8');
  const m1000 = [...sql1000.matchAll(/values \('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',/g)];
  
  const sample1000 = m1000.slice(0, 50).map(m => ({
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
    difficulty: m[12]
  }));

  const { data: d2 } = await supabase.rpc('fn_import_questions', {
    p_questions: sample1000,
    p_dry_run: true
  });
  console.log('Old 1000 (first 50) dry-run duplicates in DB:', (d2 as any)?.duplicates);
}

checkRemote();
