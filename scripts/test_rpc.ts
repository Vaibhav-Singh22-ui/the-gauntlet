import { supabase } from '../src/lib/supabase';

async function testRpc() {
  console.log('Testing fn_import_questions RPC...');
  const { data, error } = await supabase.rpc('fn_import_questions', {
    p_questions: [],
    p_dry_run: true
  });
  console.log('Result:', { data, error });
}

testRpc();
