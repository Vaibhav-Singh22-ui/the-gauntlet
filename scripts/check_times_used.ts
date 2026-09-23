import { supabase } from '../src/lib/supabase';

async function checkTimesUsed() {
  // We can query a game session or inspect via RPC
  console.log('Checking question selection over 30 spins across multiple sessions...');
  const questionsSeen = new Map<string, number>();

  for (let i = 0; i < 30; i++) {
    const { data: start } = await supabase.rpc('fn_start_game', { p_operator_id: null });
    const sid = start.session_id;

    const { data: spin } = await supabase.rpc('fn_spin_and_select_question', { p_session_id: sid });
    if (spin?.success) {
      questionsSeen.set(spin.question_text, (questionsSeen.get(spin.question_text) || 0) + 1);
    }
  }

  console.log(`Total spins: 30`);
  console.log(`Total unique questions delivered: ${questionsSeen.size}`);
  const duplicates = [...questionsSeen.entries()].filter(([_, count]) => count > 1);
  console.log(`Duplicates observed across 30 brand new sessions:`, duplicates);
}

checkTimesUsed();
