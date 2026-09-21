import { supabase } from '../src/lib/supabase';

async function testConflict() {
  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: [{
      external_id: 'EASY-L1-RED-01',
      question_text: 'What is 7 + 5?',
      option_a: '11',
      option_b: '12',
      option_c: '13',
      option_d: '14',
      correct_option: 'B',
      hint_text: 'Count 5 steps up from 7.',
      level: 1,
      color: 'RED',
      category: 'Arithmetic',
      difficulty: 'EASY',
      expected_solve_seconds: 20,
      verification_status: 'VERIFIED',
      active: true
    }],
    p_dry_run: false
  });
  console.log('Update existing EASY-L1-RED-01:', { data, error });
}

testConflict();
