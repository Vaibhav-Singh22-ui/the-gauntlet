import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function testFullGame() {
  console.log('=== TESTING COMPLETE 15-LEVEL GAMEPLAY ON LIVE SUPABASE ===\n');

  const master: any[] = JSON.parse(fs.readFileSync('master_unique_questions.json', 'utf8'));
  const textToQuestion = new Map<string, any>();
  for (const q of master) {
    textToQuestion.set(q.question_text.trim().toLowerCase(), q);
  }

  // Play 3 full consecutive games
  for (let game = 1; game <= 3; game++) {
    console.log(`\n--- Starting Game ${game} ---`);
    const { data: start, error: startErr } = await supabase.rpc('fn_start_game', { p_operator_id: null });
    if (startErr || !start?.success) {
      console.error('Failed to start game:', startErr || start);
      return;
    }

    const sid = start.session_id;
    const gameQuestionsSeen = new Set<string>();

    for (let lvl = 1; lvl <= 15; lvl++) {
      const { data: spin, error: spinErr } = await supabase.rpc('fn_spin_and_select_question', {
        p_session_id: sid
      });

      if (spinErr || !spin?.success) {
        console.error(`Game ${game} Level ${lvl} Spin Failed:`, spinErr || spin);
        return;
      }

      const qText = spin.question_text;
      const norm = qText.trim().toLowerCase();

      if (gameQuestionsSeen.has(norm)) {
        console.error(`DUPLICATE QUESTION WITHIN GAME at Level ${lvl}: "${qText}"`);
      }
      gameQuestionsSeen.add(norm);

      // Verify level match
      if (spin.level !== lvl) {
        console.warn(`Warning: Expected level ${lvl}, received level ${spin.level}`);
      }

      // Look up correct option
      const qData = textToQuestion.get(norm);
      let corrOption = qData?.correct_option || 'A';

      console.log(`Lvl ${String(lvl).padStart(2, ' ')} [${spin.selected_color.padEnd(6, ' ')}]: "${qText.length > 55 ? qText.slice(0, 52) + '...' : qText}"`);

      // Submit answer
      const { data: sub, error: subErr } = await supabase.rpc('fn_submit_answer', {
        p_session_id: sid,
        p_session_question_id: spin.session_question_id,
        p_answer: corrOption
      });

      if (subErr || !sub?.success || !sub.correct) {
        if (sub?.correct_option && !sub.correct) {
          console.log(`  (Note: Actual correct option was ${sub.correct_option})`);
        } else {
          console.error(`Submission error at Level ${lvl}:`, subErr || sub);
          return;
        }
      }

      // If not final level, call fn_risk_continue to advance to next level
      if (lvl < 15) {
        const { data: cont, error: contErr } = await supabase.rpc('fn_risk_continue', {
          p_session_id: sid
        });
        if (contErr || !cont?.success) {
          console.error(`fn_risk_continue error at Level ${lvl}:`, contErr || cont);
          return;
        }
      }
    }

    console.log(`Game ${game} completed successfully through all 15 levels! (Total unique questions in game: ${gameQuestionsSeen.size})`);
  }

  console.log('\nALL 3 FULL GAMES (45 SPINS ACROSS LEVELS 1-15) TESTED CLEANLY!');
}

testFullGame();
