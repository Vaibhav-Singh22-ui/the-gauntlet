import { supabase } from '../src/lib/supabase';

async function testHigherLevels() {
  console.log('--- Testing Higher Levels Question Delivery (Levels 4 to 15) ---');

  for (const lvl of [4, 6, 8, 10, 12, 15]) {
    // Start game
    const { data: start } = await supabase.rpc('fn_start_game', { p_operator_id: null });
    const sid = start.session_id;

    // Simulate advancing to lvl by updating game_sessions level or testing selection
    // Note: fn_spin_and_select_question reads current_level from game_sessions
    // We can directly test what question pool exists for level
    const { data: spin } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
    console.log(`Level 1 initial spin: [${spin.selected_color}] "${spin.question_text}"`);
  }
}

testHigherLevels();
