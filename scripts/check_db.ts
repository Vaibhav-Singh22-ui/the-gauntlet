import { supabase } from '../src/lib/supabase';

async function check() {
  const { data: counts, error } = await supabase
    .from('questions')
    .select('id, external_id, level, color, active, verification_status, difficulty')
    .order('level');

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log('Total questions in DB:', counts?.length);
  const byLevel: Record<number, { active: number; verified: number; total: number; colors: Record<string, number> }> = {};
  counts?.forEach((q) => {
    if (!byLevel[q.level]) byLevel[q.level] = { active: 0, verified: 0, total: 0, colors: {} };
    byLevel[q.level].total++;
    if (q.active) byLevel[q.level].active++;
    if (q.verification_status === 'VERIFIED') byLevel[q.level].verified++;
    byLevel[q.level].colors[q.color] = (byLevel[q.level].colors[q.color] || 0) + 1;
  });
  console.log('Breakdown by level:', JSON.stringify(byLevel, null, 2));

  const { data: l1 } = await supabase
    .from('questions')
    .select('external_id, question_text, color, difficulty, active, verification_status')
    .eq('level', 1)
    .limit(10);
  console.log('Sample Level 1 questions in DB:', JSON.stringify(l1, null, 2));
}

check();
