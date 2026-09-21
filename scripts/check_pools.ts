import { supabase } from '../src/lib/supabase';

async function checkPools() {
  // Start a game session
  const { data: start } = await supabase.rpc('fn_start_game', { p_operator_id: null });
  if (!start?.session_id) {
    console.error('Failed to start session');
    return;
  }
  const sid = start.session_id;

  for (let lvl = 1; lvl <= 15; lvl++) {
    // Update session current_level
    // We can test fn_spin_and_select_question
    const { data: spin, error } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
    if (error || !spin?.success) {
      console.log(`Level ${lvl}: FAILED - ${spin?.error || error?.message}`);
    } else {
      console.log(`Level ${lvl}: OK - ID: ${spin.session_question_id}, Color: ${spin.selected_color}, Q: "${spin.question_text.slice(0, 40)}..."`);
      // Submit correct or dummy answer so we can advance
      // But we can check risk_continue
    }
    // Advance to next level
    await supabase.rpc('fn_risk_continue', { p_session_id: sid });
  }
}

checkPools();
