import { supabase } from '../src/lib/supabase';

async function diagnose() {
  console.log('--- Testing 20 spins from level 1 ---');
  const results: any[] = [];
  for (let i = 0; i < 20; i++) {
    const { data: start } = await supabase.rpc('fn_start_game', { p_operator_id: null });
    const sid = start.session_id;
    const { data: spin, error } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
    if (error || !spin?.success) {
      console.log(`Spin ${i + 1} failed:`, error || spin?.error);
    } else {
      results.push({
        spin: i + 1,
        color: spin.selected_color,
        q: spin.question_text
      });
      console.log(`Spin ${i + 1} [${spin.selected_color}]: "${spin.question_text}"`);
    }
  }

  const counts: Record<string, number> = {};
  results.forEach(r => {
    counts[r.q] = (counts[r.q] || 0) + 1;
  });
  console.log('\nUnique questions count:', Object.keys(counts).length);
  console.log('Question distribution:', counts);
}

diagnose();
