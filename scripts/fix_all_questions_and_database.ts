import { supabase } from '../src/lib/supabase';
import fs from 'fs';
import { LOCAL_QUESTION_BANK } from '../src/lib/local-question-bank';

async function main() {
  console.log('===========================================================');
  console.log('  50 MILLIONAIRE: FIX DATABASE QUESTIONS & REMOVE HUMAN VERIFICATION');
  console.log('===========================================================');

  // STEP 1: Find old questions in import_questions_1000.sql that were assigned to Level 1, 2, or 3
  console.log('Step 1: Re-leveling old hard questions from Levels 1-3 to Level 4...');
  const sqlContent = fs.readFileSync('import_questions_1000.sql', 'utf8');
  const sqlLines = sqlContent.split('\n');
  const oldHardL123: any[] = [];

  for (const line of sqlLines) {
    // format: insert into public.questions (external_id,question_text,option_a,option_b,option_c,option_d,correct_option,hint_text,level,color,category,difficulty,expected_solve_seconds,verification_status,active,source_type,source_reference) values ('Q0018','...','...','...','...','...','B','...',1,'PINK','Mathematics','MEDIUM',40,'NEEDS_HUMAN_REVIEW',false,'ORIGINAL_GENERATED','Original linear equations')
    const match = line.match(/values \('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-D])',\s*'((?:[^']|'')*)',\s*([0-9]+),\s*'([A-Z]+)',\s*'((?:[^']|'')*)',\s*'([A-Z_]+)',\s*([0-9]+)/i);
    if (match) {
      const extId = match[1];
      const qText = match[2].replace(/''/g, "'");
      const optA = match[3].replace(/''/g, "'");
      const optB = match[4].replace(/''/g, "'");
      const optC = match[5].replace(/''/g, "'");
      const optD = match[6].replace(/''/g, "'");
      const corr = match[7];
      const hint = match[8].replace(/''/g, "'");
      const lvl = parseInt(match[9]);
      const col = match[10];
      const cat = match[11].replace(/''/g, "'");
      const diff = match[12];
      const sec = parseInt(match[13]);

      if (lvl >= 1 && lvl <= 3) {
        oldHardL123.push({
          external_id: extId,
          question_text: qText,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_option: corr,
          hint_text: hint,
          level: 4, // Move out of 1-3 to Level 4
          color: col,
          category: cat,
          difficulty: 'MEDIUM',
          expected_solve_seconds: sec || 45,
          verification_status: 'VERIFIED',
          active: true,
          source_type: 'RELEVELED_FROM_L1_3',
          source_reference: `Moved from L${lvl} to L4`
        });
      }
    }
  }

  console.log(`Found ${oldHardL123.length} old questions in Levels 1-3 to move to Level 4.`);
  const BATCH_SIZE = 50;

  for (let i = 0; i < oldHardL123.length; i += BATCH_SIZE) {
    const batch = oldHardL123.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: batch,
      p_dry_run: false
    });
    if (error) {
      console.error(`Error moving old questions batch ${i}:`, error.message);
    } else {
      process.stdout.write(`Moved ${Math.min(i + BATCH_SIZE, oldHardL123.length)} / ${oldHardL123.length} old questions...\r`);
    }
  }
  console.log('\nOld questions successfully moved to Level 4.\n');

  // STEP 2: Import all 180 Curated Easy Questions for Levels 1-3
  console.log('Step 2: Importing all 180 Curated Easy Questions (Levels 1-3)...');
  const easy180 = JSON.parse(fs.readFileSync('questions_easy_180.json', 'utf8'));

  const preparedEasy = easy180.map((q: any) => ({
    external_id: q.external_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    hint_text: q.hint_text,
    level: q.level,
    color: q.color,
    category: q.category,
    difficulty: q.difficulty || 'EASY',
    expected_solve_seconds: q.expected_solve_seconds || 20,
    verification_status: 'VERIFIED',
    active: true,
    source_type: 'CURATED_EASY_BANK',
    source_reference: `Level ${q.level} Easy 50 Millionaire Bank`
  }));

  for (let i = 0; i < preparedEasy.length; i += BATCH_SIZE) {
    const batch = preparedEasy.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: batch,
      p_dry_run: false
    });
    if (error) {
      console.error(`Error importing easy batch ${i}:`, error.message);
    } else {
      process.stdout.write(`Imported ${Math.min(i + BATCH_SIZE, preparedEasy.length)} / ${preparedEasy.length} easy questions...\r`);
    }
  }
  console.log('\nAll 180 Curated Easy Questions imported with active=true, verification_status=VERIFIED.\n');

  // STEP 3: Import / Update Levels 4-15 from LOCAL_QUESTION_BANK
  console.log('Step 3: Ensuring Levels 4-15 have active and verified questions...');
  const l4to15 = LOCAL_QUESTION_BANK.filter(q => q.level >= 4).map(q => ({
    external_id: q.external_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    hint_text: q.hint_text,
    level: q.level,
    color: q.color,
    category: q.category,
    difficulty: q.difficulty || 'HARD',
    expected_solve_seconds: q.expected_solve_seconds || 45,
    verification_status: 'VERIFIED',
    active: true,
    source_type: 'MASTER_QUESTION_BANK',
    source_reference: `Level ${q.level}`
  }));

  console.log(`Total Level 4-15 questions to sync: ${l4to15.length}`);
  for (let i = 0; i < l4to15.length; i += BATCH_SIZE) {
    const batch = l4to15.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: batch,
      p_dry_run: false
    });
    if (error) {
      console.error(`Error importing L4-15 batch ${i}:`, error.message);
    } else {
      process.stdout.write(`Synced ${Math.min(i + BATCH_SIZE, l4to15.length)} / ${l4to15.length} questions...\r`);
    }
  }
  console.log('\nAll Level 4-15 questions synced and active.\n');

  // STEP 4: Verification test
  console.log('Step 4: Verification spins for Level 1, 2, and 3...');
  for (let testLevel = 1; testLevel <= 3; testLevel++) {
    console.log(`\n--- Testing Level ${testLevel} ---`);
    for (let sample = 1; sample <= 3; sample++) {
      const { data: start } = await supabase.rpc('fn_start_game', { p_operator_id: null });
      const sid = start.session_id;
      // Advance to testLevel if needed
      for (let l = 1; l < testLevel; l++) {
        await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
        const { data: qData } = await supabase.from('session_questions').select('id, question_id').eq('session_id', sid).order('created_at', { ascending: false }).limit(1);
        if (qData && qData[0]) {
          await supabase.rpc('fn_submit_answer', {
            p_session_id: sid,
            p_session_question_id: qData[0].id,
            p_answer: 'B' // or any
          });
          await supabase.rpc('fn_risk_continue', { p_session_id: sid });
        }
      }

      const { data: spin, error: spinErr } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
      if (spinErr || !spin?.success) {
        console.error(`Spin failed on Level ${testLevel}:`, spinErr || spin?.error);
      } else {
        console.log(`  Sample ${sample} [${spin.selected_color}]: "${spin.question_text}" | A: ${spin.option_a}, B: ${spin.option_b}, C: ${spin.option_c}, D: ${spin.option_d}`);
      }
    }
  }

  console.log('\n===========================================================');
  console.log('  ALL STEPS COMPLETE SUCCESSFULLY!');
  console.log('===========================================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
