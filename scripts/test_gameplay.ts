import { supabase } from '../src/lib/supabase';

async function testGameplay() {
  console.log('Testing start game and spin...');
  const { data: startData, error: startErr } = await supabase.rpc('fn_start_game', { p_operator_id: null });
  console.log('Start game:', { startData, startErr });
  if (startErr || !startData?.session_id) return;

  const sessionId = startData.session_id;
  const { data: spinData, error: spinErr } = await supabase.rpc('fn_spin_and_select_question', {
    p_session_id: sessionId
  });
  console.log('Spin question result:', { spinData, spinErr });
}

testGameplay();
