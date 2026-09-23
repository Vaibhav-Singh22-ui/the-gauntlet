-- =================================================================
-- 50 MILLIONAIRE ANTI-REPETITION & LRU SELECTION OPTIMIZATION
-- Migration: 20260921000000_anti_repetition_lru.sql
-- Description:
-- 1. Updates fn_spin_and_select_question to use LRU (Least Recently Used)
--    ordering (ORDER BY q.times_used ASC, random()) so that questions
--    with the lowest usage frequency are strictly prioritized.
-- 2. Resets times_used on all active verified questions so that all
--    pool questions rotate in a round-robin cycle before repeating.
-- =================================================================

CREATE OR REPLACE FUNCTION public.fn_spin_and_select_question(
  p_session_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_colors text[] := ARRAY['RED','BLUE','GREEN','YELLOW','PINK','VIOLET'];
  v_selected_color text;
  v_question public.questions%ROWTYPE;
  v_session_question public.session_questions%ROWTYPE;
  v_now timestamptz := clock_timestamp();
BEGIN
  -- 1. Validate and lock active session
  SELECT * INTO v_session
  FROM public.game_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.status NOT IN ('LEVEL_INTRO', 'WHEEL', 'CREATED') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid session state for wheel spin: ' || v_session.status);
  END IF;

  -- 2. Server selects color randomly
  v_selected_color := v_colors[1 + floor(random() * 6)::int];

  -- 3. Primary Selection:
  -- Matches current level + selected color + active + verified + not already used in this session.
  -- Uses LRU prioritization (times_used ASC) so every question rotates before repeats.
  SELECT * INTO v_question
  FROM public.questions q
  WHERE q.level = v_session.current_level
    AND q.color = v_selected_color
    AND q.active = true
    AND q.verification_status = 'VERIFIED'
    AND q.id NOT IN (
      SELECT question_id FROM public.session_questions WHERE session_id = p_session_id
    )
  ORDER BY q.times_used ASC, random()
  LIMIT 1;

  -- 4. Fallback Selection (if color pool exhausted for this session):
  -- Any other color at this level that has not been shown in this session, ordered by LRU.
  IF NOT FOUND THEN
    SELECT * INTO v_question
    FROM public.questions q
    WHERE q.level = v_session.current_level
      AND q.active = true
      AND q.verification_status = 'VERIFIED'
      AND q.id NOT IN (
        SELECT question_id FROM public.session_questions WHERE session_id = p_session_id
      )
    ORDER BY q.times_used ASC, random()
    LIMIT 1;

    IF FOUND THEN
      v_selected_color := v_question.color;
    END IF;
  END IF;

  -- 5. Complete exhaustion check
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Question pool completely exhausted for Level ' || v_session.current_level);
  END IF;

  -- 6. Record presentation in session_questions
  INSERT INTO public.session_questions (
    session_id,
    question_id,
    level,
    selected_color,
    presented_at
  )
  VALUES (
    p_session_id,
    v_question.id,
    v_session.current_level,
    v_selected_color,
    v_now
  )
  RETURNING * INTO v_session_question;

  -- 7. Increment times_used for LRU rotation
  UPDATE public.questions
  SET times_used = times_used + 1, updated_at = now()
  WHERE id = v_question.id;

  -- 8. Advance session state
  UPDATE public.game_sessions
  SET status = 'QUESTION_ACTIVE', updated_at = now()
  WHERE id = p_session_id;

  -- 9. Return safe client payload (correct_option stays strictly server-side)
  RETURN json_build_object(
    'success', true,
    'session_question_id', v_session_question.id,
    'level', v_session.current_level,
    'selected_color', v_selected_color,
    'question_text', v_question.question_text,
    'option_a', v_question.option_a,
    'option_b', v_question.option_b,
    'option_c', v_question.option_c,
    'option_d', v_question.option_d,
    'presented_at', v_now,
    'hint_available', v_session.lifeline_hint_available,
    'fifty_fifty_available', v_session.lifeline_fifty_fifty_available,
    'current_reward', v_session.current_reward,
    'next_reward', v_session.current_level * 10
  );
END;
$$;

-- Reset times_used across all active verified questions to establish balanced LRU baseline
UPDATE public.questions
SET times_used = 0
WHERE active = true AND verification_status = 'VERIFIED';
