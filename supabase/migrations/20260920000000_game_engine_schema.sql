-- =================================================================
-- ₹50 Challenge — Production Database Schema & Authoritative Engine
-- =================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  hint_text text NOT NULL,
  level int NOT NULL CHECK (level BETWEEN 1 AND 15),
  color text NOT NULL CHECK (color IN ('RED','BLUE','GREEN','YELLOW','PINK','VIOLET')),
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('EASY','MEDIUM','HARD')),
  expected_solve_seconds int NOT NULL CHECK (expected_solve_seconds BETWEEN 1 AND 60),
  verification_status text NOT NULL DEFAULT 'NEEDS_HUMAN_REVIEW' CHECK (verification_status IN ('NEEDS_HUMAN_REVIEW', 'VERIFIED', 'REJECTED')),
  active boolean NOT NULL DEFAULT false,
  source_type text DEFAULT 'ORIGINAL_GENERATED',
  source_reference text,
  times_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_level_color_active_idx
  ON public.questions(level, color, active, verification_status);

CREATE INDEX IF NOT EXISTS questions_external_id_idx
  ON public.questions(external_id);

CREATE INDEX IF NOT EXISTS questions_active_idx
  ON public.questions(active);

-- 2. OPERATOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.operator_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'admin')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'CREATED' CHECK (
    status IN (
      'CREATED',
      'LEVEL_INTRO',
      'WHEEL',
      'QUESTION_ACTIVE',
      'ANSWER_SUBMITTED',
      'CORRECT',
      'RISK_DECISION',
      'GAME_OVER',
      'COMPLETED'
    )
  ),
  current_level int NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 15),
  current_reward int NOT NULL DEFAULT 0,
  lifeline_hint_available boolean NOT NULL DEFAULT true,
  lifeline_fifty_fifty_available boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  final_reward int NOT NULL DEFAULT 0,
  final_level int NOT NULL DEFAULT 1,
  result text CHECK (result IN ('WON', 'LOST_WRONG', 'LOST_TIMEOUT', 'ABANDONED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_sessions_status_idx ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS game_sessions_created_idx ON public.game_sessions(created_at DESC);

-- 4. SESSION QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  level int NOT NULL CHECK (level BETWEEN 1 AND 15),
  selected_color text NOT NULL CHECK (selected_color IN ('RED','BLUE','GREEN','YELLOW','PINK','VIOLET')),
  presented_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  answered_at timestamptz,
  answer text CHECK (answer IN ('A','B','C','D')),
  result text CHECK (result IN ('CORRECT', 'WRONG', 'TIMEOUT')),
  time_remaining int,
  lifeline_hint_used boolean NOT NULL DEFAULT false,
  lifeline_fifty_fifty_used boolean NOT NULL DEFAULT false,
  removed_options text[] DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_questions_session_idx ON public.session_questions(session_id);
CREATE INDEX IF NOT EXISTS session_questions_question_idx ON public.session_questions(question_id);

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;

-- Questions: Public/Anon cannot read questions directly (must go through game engine RPC)
DROP POLICY IF EXISTS questions_anon_deny ON public.questions;
DROP POLICY IF EXISTS questions_operator_all ON public.questions;

CREATE POLICY questions_operator_all ON public.questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.operator_profiles WHERE id = auth.uid() AND active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.operator_profiles WHERE id = auth.uid() AND active = true)
  );

-- Game Sessions: Read/Insert allowed for gameplay
DROP POLICY IF EXISTS sessions_read_public ON public.game_sessions;
CREATE POLICY sessions_read_public ON public.game_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS sessions_operator_all ON public.game_sessions;
CREATE POLICY sessions_operator_all ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.operator_profiles WHERE id = auth.uid() AND active = true)
  );

-- Session Questions: Read allowed for active session
DROP POLICY IF EXISTS session_questions_read_public ON public.session_questions;
CREATE POLICY session_questions_read_public ON public.session_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Operator Profiles
DROP POLICY IF EXISTS operator_profiles_read_own ON public.operator_profiles;
CREATE POLICY operator_profiles_read_own ON public.operator_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- =================================================================
-- SERVER-AUTHORITATIVE ENGINE FUNCTIONS (SECURITY DEFINER)
-- =================================================================

-- 1. START GAME
CREATE OR REPLACE FUNCTION public.fn_start_game(p_operator_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
BEGIN
  INSERT INTO public.game_sessions (
    operator_id,
    status,
    current_level,
    current_reward,
    lifeline_hint_available,
    lifeline_fifty_fifty_available,
    started_at
  )
  VALUES (
    p_operator_id,
    'LEVEL_INTRO',
    1,
    0,
    true,
    true,
    now()
  )
  RETURNING * INTO v_session;

  RETURN json_build_object(
    'success', true,
    'session_id', v_session.id,
    'status', v_session.status,
    'current_level', v_session.current_level,
    'current_reward', v_session.current_reward,
    'lifeline_hint_available', v_session.lifeline_hint_available,
    'lifeline_fifty_fifty_available', v_session.lifeline_fifty_fifty_available
  );
END;
$$;

-- 2. SPIN WHEEL & SELECT QUESTION
CREATE OR REPLACE FUNCTION public.fn_spin_and_select_question(p_session_id uuid)
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
  -- Validate session
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.status NOT IN ('LEVEL_INTRO', 'WHEEL', 'CREATED') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid session state for wheel spin: ' || v_session.status);
  END IF;

  -- Server selects color randomly
  v_selected_color := v_colors[1 + floor(random() * 6)::int];

  -- Query eligible question:
  -- current level + selected color + active + verified + not already used in session
  SELECT * INTO v_question
  FROM public.questions q
  WHERE q.level = v_session.current_level
    AND q.color = v_selected_color
    AND q.active = true
    AND q.verification_status = 'VERIFIED'
    AND q.id NOT IN (
      SELECT question_id FROM public.session_questions WHERE session_id = p_session_id
    )
  ORDER BY random()
  LIMIT 1;

  -- Safe pool fallback if exhausted for this color:
  IF NOT FOUND THEN
    -- Fallback: any color at this level
    SELECT * INTO v_question
    FROM public.questions q
    WHERE q.level = v_session.current_level
      AND q.active = true
      AND q.verification_status = 'VERIFIED'
      AND q.id NOT IN (
        SELECT question_id FROM public.session_questions WHERE session_id = p_session_id
      )
    ORDER BY random()
    LIMIT 1;

    -- If still no verified+active question, fallback to any active question at level or seed
    IF NOT FOUND THEN
      SELECT * INTO v_question
      FROM public.questions q
      WHERE q.level = v_session.current_level
        AND q.id NOT IN (
          SELECT question_id FROM public.session_questions WHERE session_id = p_session_id
        )
      ORDER BY random()
      LIMIT 1;
    END IF;

    IF FOUND THEN
      v_selected_color := v_question.color;
    END IF;
  END IF;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Question pool completely exhausted for Level ' || v_session.current_level);
  END IF;

  -- Record session question
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

  -- Update question times_used
  UPDATE public.questions
  SET times_used = times_used + 1, updated_at = now()
  WHERE id = v_question.id;

  -- Update session status
  UPDATE public.game_sessions
  SET status = 'QUESTION_ACTIVE', updated_at = now()
  WHERE id = p_session_id;

  -- Return SAFE payload (NO correct_option!)
  RETURN json_build_object(
    'success', true,
    'session_id', p_session_id,
    'session_question_id', v_session_question.id,
    'level', v_session.current_level,
    'selected_color', v_selected_color,
    'question_text', v_question.question_text,
    'option_a', v_question.option_a,
    'option_b', v_question.option_b,
    'option_c', v_question.option_c,
    'option_d', v_question.option_d,
    'presented_at', v_session_question.presented_at,
    'hint_available', v_session.lifeline_hint_available,
    'fifty_fifty_available', v_session.lifeline_fifty_fifty_available,
    'current_reward', v_session.current_reward,
    'next_reward', (v_session.current_level * 10)
  );
END;
$$;

-- 3. SUBMIT ANSWER
CREATE OR REPLACE FUNCTION public.fn_submit_answer(
  p_session_id uuid,
  p_session_question_id uuid,
  p_answer text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_session_question public.session_questions%ROWTYPE;
  v_question public.questions%ROWTYPE;
  v_now timestamptz := clock_timestamp();
  v_elapsed_seconds numeric;
  v_is_correct boolean;
  v_is_timeout boolean := false;
  v_reward_earned int;
  v_new_status text;
  v_result text;
BEGIN
  -- Validate answer parameter
  IF p_answer NOT IN ('A', 'B', 'C', 'D', 'TIMEOUT') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid answer option');
  END IF;

  -- Lock session
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.status != 'QUESTION_ACTIVE' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot submit answer in status: ' || v_session.status);
  END IF;

  -- Lock session question
  SELECT * INTO v_session_question
  FROM public.session_questions
  WHERE id = p_session_question_id AND session_id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session question record not found');
  END IF;

  IF v_session_question.answered_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Question already answered');
  END IF;

  -- Fetch question (including correct_option)
  SELECT * INTO v_question FROM public.questions WHERE id = v_session_question.question_id;

  -- Calculate server-side elapsed time
  v_elapsed_seconds := extract(epoch FROM (v_now - v_session_question.presented_at));

  -- 60 seconds allowed + 2.5 second network buffer
  IF p_answer = 'TIMEOUT' OR v_elapsed_seconds > 62.5 THEN
    v_is_timeout := true;
    v_is_correct := false;
  ELSE
    v_is_correct := (p_answer = v_question.correct_option);
  END IF;

  IF v_is_timeout THEN
    -- TIMEOUT -> ₹0, Game Over
    v_new_status := 'GAME_OVER';
    v_result := 'LOST_TIMEOUT';

    UPDATE public.session_questions
    SET answered_at = v_now,
        answer = 'TIMEOUT',
        result = 'TIMEOUT',
        time_remaining = 0
    WHERE id = p_session_question_id;

    UPDATE public.game_sessions
    SET status = 'GAME_OVER',
        ended_at = v_now,
        current_reward = 0,
        final_reward = 0,
        final_level = v_session.current_level,
        result = 'LOST_TIMEOUT',
        updated_at = now()
    WHERE id = p_session_id;

    RETURN json_build_object(
      'success', true,
      'result', 'TIMEOUT',
      'correct', false,
      'is_timeout', true,
      'correct_option', v_question.correct_option,
      'status', 'GAME_OVER',
      'current_reward', 0,
      'current_level', v_session.current_level
    );

  ELSIF v_is_correct THEN
    v_reward_earned := v_session.current_level * 10;

    IF v_session.current_level = 15 THEN
      -- LEVEL 15 VICTORY -> ₹150, Complete
      v_new_status := 'COMPLETED';
      v_result := 'WON';

      UPDATE public.session_questions
      SET answered_at = v_now,
          answer = p_answer,
          result = 'CORRECT',
          time_remaining = greatest(0, 60 - floor(v_elapsed_seconds)::int)
      WHERE id = p_session_question_id;

      UPDATE public.game_sessions
      SET status = 'COMPLETED',
          ended_at = v_now,
          current_reward = 150,
          final_reward = 150,
          final_level = 15,
          result = 'WON',
          updated_at = now()
      WHERE id = p_session_id;

      RETURN json_build_object(
        'success', true,
        'result', 'CORRECT',
        'correct', true,
        'is_timeout', false,
        'correct_option', v_question.correct_option,
        'status', 'COMPLETED',
        'current_reward', 150,
        'current_level', 15
      );
    ELSE
      -- Correct answer -> advances to RISK_DECISION
      v_new_status := 'RISK_DECISION';

      UPDATE public.session_questions
      SET answered_at = v_now,
          answer = p_answer,
          result = 'CORRECT',
          time_remaining = greatest(0, 60 - floor(v_elapsed_seconds)::int)
      WHERE id = p_session_question_id;

      UPDATE public.game_sessions
      SET status = 'RISK_DECISION',
          current_reward = v_reward_earned,
          final_reward = v_reward_earned,
          final_level = v_session.current_level,
          updated_at = now()
      WHERE id = p_session_id;

      RETURN json_build_object(
        'success', true,
        'result', 'CORRECT',
        'correct', true,
        'is_timeout', false,
        'correct_option', v_question.correct_option,
        'status', 'RISK_DECISION',
        'current_reward', v_reward_earned,
        'current_level', v_session.current_level
      );
    END IF;

  ELSE
    -- WRONG ANSWER -> ₹0, Game Over
    v_new_status := 'GAME_OVER';
    v_result := 'LOST_WRONG';

    UPDATE public.session_questions
    SET answered_at = v_now,
        answer = p_answer,
        result = 'WRONG',
        time_remaining = greatest(0, 60 - floor(v_elapsed_seconds)::int)
    WHERE id = p_session_question_id;

    UPDATE public.game_sessions
    SET status = 'GAME_OVER',
        ended_at = v_now,
        current_reward = 0,
        final_reward = 0,
        final_level = v_session.current_level,
        result = 'LOST_WRONG',
        updated_at = now()
    WHERE id = p_session_id;

    RETURN json_build_object(
      'success', true,
      'result', 'WRONG',
      'correct', false,
      'is_timeout', false,
      'correct_option', v_question.correct_option,
      'status', 'GAME_OVER',
      'current_reward', 0,
      'current_level', v_session.current_level
    );
  END IF;
END;
$$;

-- 4. USE HINT
CREATE OR REPLACE FUNCTION public.fn_use_hint(
  p_session_id uuid,
  p_session_question_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_session_question public.session_questions%ROWTYPE;
  v_question public.questions%ROWTYPE;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR v_session.status != 'QUESTION_ACTIVE' THEN
    RETURN json_build_object('success', false, 'error', 'Invalid session state for hint');
  END IF;

  IF NOT v_session.lifeline_hint_available THEN
    RETURN json_build_object('success', false, 'error', 'Hint lifeline already used');
  END IF;

  SELECT * INTO v_session_question
  FROM public.session_questions
  WHERE id = p_session_question_id AND session_id = p_session_id;

  IF NOT FOUND OR v_session_question.answered_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid question for hint');
  END IF;

  SELECT * INTO v_question FROM public.questions WHERE id = v_session_question.question_id;

  -- Consume hint
  UPDATE public.game_sessions
  SET lifeline_hint_available = false, updated_at = now()
  WHERE id = p_session_id;

  UPDATE public.session_questions
  SET lifeline_hint_used = true
  WHERE id = p_session_question_id;

  RETURN json_build_object(
    'success', true,
    'hint_text', v_question.hint_text
  );
END;
$$;

-- 5. USE 50:50
CREATE OR REPLACE FUNCTION public.fn_use_fifty_fifty(
  p_session_id uuid,
  p_session_question_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_session_question public.session_questions%ROWTYPE;
  v_question public.questions%ROWTYPE;
  v_wrong_options text[];
  v_removed_options text[];
  v_candidate text;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR v_session.status != 'QUESTION_ACTIVE' THEN
    RETURN json_build_object('success', false, 'error', 'Invalid session state for 50:50');
  END IF;

  IF NOT v_session.lifeline_fifty_fifty_available THEN
    RETURN json_build_object('success', false, 'error', '50:50 lifeline already used');
  END IF;

  SELECT * INTO v_session_question
  FROM public.session_questions
  WHERE id = p_session_question_id AND session_id = p_session_id;

  IF NOT FOUND OR v_session_question.answered_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid question for 50:50');
  END IF;

  SELECT * INTO v_question FROM public.questions WHERE id = v_session_question.question_id;

  -- Collect the 3 wrong options
  v_wrong_options := ARRAY[]::text[];
  FOREACH v_candidate IN ARRAY ARRAY['A','B','C','D']
  LOOP
    IF v_candidate != v_question.correct_option THEN
      v_wrong_options := array_append(v_wrong_options, v_candidate);
    END IF;
  END LOOP;

  -- Randomly shuffle the 3 wrong options and pick 2
  SELECT ARRAY(
    SELECT unnest(v_wrong_options) ORDER BY random() LIMIT 2
  ) INTO v_removed_options;

  -- Consume 50:50
  UPDATE public.game_sessions
  SET lifeline_fifty_fifty_available = false, updated_at = now()
  WHERE id = p_session_id;

  UPDATE public.session_questions
  SET lifeline_fifty_fifty_used = true,
      removed_options = v_removed_options
  WHERE id = p_session_question_id;

  RETURN json_build_object(
    'success', true,
    'removed_options', v_removed_options
  );
END;
$$;

-- 6. RISK / CONTINUE TO NEXT LEVEL
CREATE OR REPLACE FUNCTION public.fn_risk_continue(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_next_level int;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.status != 'RISK_DECISION' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot risk continue in status: ' || v_session.status);
  END IF;

  IF v_session.current_level >= 15 THEN
    RETURN json_build_object('success', false, 'error', 'Already reached maximum level');
  END IF;

  v_next_level := v_session.current_level + 1;

  UPDATE public.game_sessions
  SET current_level = v_next_level,
      status = 'LEVEL_INTRO',
      updated_at = now()
  WHERE id = p_session_id;

  RETURN json_build_object(
    'success', true,
    'session_id', p_session_id,
    'status', 'LEVEL_INTRO',
    'current_level', v_next_level,
    'current_reward', v_session.current_reward,
    'risk_reward', (v_next_level * 10)
  );
END;
$$;

-- 7. RESET GAME (FOR NEXT PLAYER AT STALL)
CREATE OR REPLACE FUNCTION public.fn_reset_game(p_operator_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.fn_start_game(p_operator_id);
END;
$$;

-- 8. GET SESSION STATE
CREATE OR REPLACE FUNCTION public.fn_get_session_state(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_session_question public.session_questions%ROWTYPE;
  v_question public.questions%ROWTYPE;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.status = 'QUESTION_ACTIVE' THEN
    SELECT * INTO v_session_question
    FROM public.session_questions
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      SELECT * INTO v_question FROM public.questions WHERE id = v_session_question.question_id;

      RETURN json_build_object(
        'success', true,
        'session_id', v_session.id,
        'status', v_session.status,
        'current_level', v_session.current_level,
        'current_reward', v_session.current_reward,
        'lifeline_hint_available', v_session.lifeline_hint_available,
        'lifeline_fifty_fifty_available', v_session.lifeline_fifty_fifty_available,
        'question', json_build_object(
          'session_question_id', v_session_question.id,
          'level', v_session_question.level,
          'selected_color', v_session_question.selected_color,
          'question_text', v_question.question_text,
          'option_a', v_question.option_a,
          'option_b', v_question.option_b,
          'option_c', v_question.option_c,
          'option_d', v_question.option_d,
          'presented_at', v_session_question.presented_at,
          'removed_options', v_session_question.removed_options,
          'lifeline_hint_used', v_session_question.lifeline_hint_used
        )
      );
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'session_id', v_session.id,
    'status', v_session.status,
    'current_level', v_session.current_level,
    'current_reward', v_session.current_reward,
    'lifeline_hint_available', v_session.lifeline_hint_available,
    'lifeline_fifty_fifty_available', v_session.lifeline_fifty_fifty_available,
    'final_reward', v_session.final_reward,
    'result', v_session.result
  );
END;
$$;
