import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function testAll180() {
  const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
  console.log(`Testing dry run for all ${easy180.length} questions...`);

  // Ensure active = true and verification_status = 'VERIFIED'
  const prepared = easy180.map((q: any) => ({
    ...q,
    active: true,
    verification_status: 'VERIFIED'
  }));

  const BATCH = 50;
  let totalValid = 0;
  let totalInvalid = 0;
  const errors: any[] = [];

  for (let i = 0; i < prepared.length; i += BATCH) {
    const batch = prepared.slice(i, i + BATCH);
    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: batch,
      p_dry_run: true
    });
    if (error) {
      console.error(`Batch ${i / BATCH} error:`, error);
      break;
    }
    totalValid += (data as any)?.valid || 0;
    totalInvalid += (data as any)?.invalid || 0;
    if ((data as any)?.errors?.length) {
      errors.push(...(data as any).errors);
    }
  }

  console.log(`Dry run result: valid=${totalValid}, invalid=${totalInvalid}, errors=${errors.length}`);
  if (errors.length > 0) {
    console.log('Sample errors:', errors.slice(0, 5));
  }
}

testAll180();
