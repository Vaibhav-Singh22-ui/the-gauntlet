import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function testImportLive() {
  const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));
  const testItem = [easy180[0]]; // EASY-L1-RED-01

  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: testItem,
    p_dry_run: false
  });
  console.log('fn_import_questions LIVE result:', { data, error });
}

testImportLive();
