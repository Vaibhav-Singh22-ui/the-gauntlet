import { supabase } from '../src/lib/supabase';

async function sampleEachLevel() {
  for (let lvl = 1; lvl <= 15; lvl++) {
    const qTexts = new Set<string>();
    const colors = new Set<string>();
    for (let i = 0; i < 6; i++) {
      const { data: start } = await supabase.rpc('fn_start_game', {});
      const sid = start.session_id;
      // Advance to lvl
      for (let l = 1; l < lvl; l++) {
        await supabase.rpc('fn_risk_continue', { p_session_id: sid });
      }
      const { data: spin } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
      if (spin?.question_text) {
        qTexts.add(spin.question_text);
        colors.add(spin.selected_color);
      }
    }
    console.log(`Level ${lvl.toString().padStart(2)}: colors seen=[${[...colors].join(', ')}], sample questions: ${[...qTexts].map(t => `"${t.slice(0, 35)}..."`).join(' | ')}`);
  }
}

sampleEachLevel();
