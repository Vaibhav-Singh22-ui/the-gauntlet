import { supabase } from '../src/lib/supabase';

async function checkExistence() {
  const testIds = [
    { external_id: 'EASY-L1-RED-01', question_text: 'test', option_a: '1', option_b: '2', option_c: '3', option_d: '4', correct_option: 'A', level: 1, color: 'RED', difficulty: 'VERY_VERY_EASY' },
    { external_id: 'Q0001', question_text: 'test', option_a: '1', option_b: '2', option_c: '3', option_d: '4', correct_option: 'A', level: 4, color: 'RED', difficulty: 'MEDIUM' },
    { external_id: 'MME180_001', question_text: 'test', option_a: '1', option_b: '2', option_c: '3', option_d: '4', correct_option: 'A', level: 1, color: 'RED', difficulty: 'VERY_VERY_EASY' },
    { external_id: 'NON_EXISTENT_XYZ', question_text: 'test', option_a: '1', option_b: '2', option_c: '3', option_d: '4', correct_option: 'A', level: 1, color: 'RED', difficulty: 'VERY_VERY_EASY' },
  ];

  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: testIds,
    p_dry_run: true
  });
  console.log('Result:', JSON.stringify(data, null, 2), error);
}

checkExistence();
