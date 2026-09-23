import { supabase } from '../src/lib/supabase';

async function testStats() {
  const { data, error } = await supabase.rpc('fn_operator_get_stats');
  console.log('Operator stats:', data, error);
}

testStats();
