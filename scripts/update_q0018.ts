import { supabase } from '../src/lib/supabase';

async function updateQ0018() {
  console.log('Moving Q0018 to Level 4 so it never appears in Level 1...');
  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: [{
      external_id: 'Q0018',
      question_text: 'If x + y = 14 and x - y = 8, what is x?',
      option_a: '10',
      option_b: '11',
      option_c: '12',
      option_d: '3',
      correct_option: 'B',
      hint_text: 'Add the two equations.',
      level: 4, // Moved out of Level 1!
      color: 'PINK',
      category: 'Mathematics',
      difficulty: 'MEDIUM',
      expected_solve_seconds: 40,
      verification_status: 'VERIFIED',
      active: true
    }],
    p_dry_run: false
  });

  console.log('Update Q0018 result:', { data, error });
}

updateQ0018();
