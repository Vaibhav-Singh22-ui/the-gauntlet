import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function testValidation() {
  const master: any[] = JSON.parse(fs.readFileSync('master_unique_questions.json', 'utf8'));

  // Test one from each level
  const testSamples: any[] = [];
  for (let l = 1; l <= 15; l++) {
    const q = master.find(m => m.level === l);
    if (q) testSamples.push({ ...q });
  }

  console.log(`Testing ${testSamples.length} samples with difficulty: L1-3=${testSamples[0].difficulty}, L4+=${testSamples[3].difficulty}`);

  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: testSamples,
    p_dry_run: true
  });

  console.log('Result:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

testValidation();
