import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function countExistingEasy() {
  const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
  const mapped = easy180.map((q: any) => ({ ...q, difficulty: 'EASY' }));
  
  let totalDuplicates = 0;
  const BATCH = 50;

  for (let i = 0; i < mapped.length; i += BATCH) {
    const slice = mapped.slice(i, i + BATCH);
    const { data } = await supabase.rpc('fn_import_questions', {
      p_questions: slice,
      p_dry_run: true
    });
    totalDuplicates += (data as any)?.duplicates || 0;
  }

  console.log(`Out of ${mapped.length} from questions_easy_180.json: duplicates (already in DB)=${totalDuplicates}`);
}

countExistingEasy();
