-- =================================================================
-- APTITUDE GAMES — ADDITIVE DATABASE MIGRATION
-- Migration: 20260921100000_aptitude_game_sessions.sql
-- Description:
-- Dedicated sessions table for Aptitude Games arcade.
-- Completely isolated from 50 Millionaire game_sessions and questions.
-- =================================================================

CREATE TABLE IF NOT EXISTS public.aptitude_game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  game_type text NOT NULL CHECK (
    game_type IN (
      'NUMBER_SPRINT',
      'TARGET_24',
      'GRID_LOGIC',
      'MISSING_PIECE',
      'ARRANGEMENT_MASTER'
    )
  ),
  difficulty text NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  round int NOT NULL DEFAULT 1,
  total_rounds int NOT NULL DEFAULT 5,
  score int NOT NULL DEFAULT 0,
  streak int NOT NULL DEFAULT 0,
  max_streak int NOT NULL DEFAULT 0,
  time_remaining int,
  attempts int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (
    status IN ('ACTIVE', 'COMPLETED', 'ABANDONED', 'TIME_OUT')
  ),
  seed text NOT NULL,
  game_state jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indices for rapid querying and leaderboard lookups
CREATE INDEX IF NOT EXISTS aptitude_game_sessions_player_idx
  ON public.aptitude_game_sessions(player_id);

CREATE INDEX IF NOT EXISTS aptitude_game_sessions_game_type_idx
  ON public.aptitude_game_sessions(game_type, difficulty, score DESC);

CREATE INDEX IF NOT EXISTS aptitude_game_sessions_status_idx
  ON public.aptitude_game_sessions(status);

-- RLS Policies
ALTER TABLE public.aptitude_game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aptitude_sessions_select ON public.aptitude_game_sessions;
CREATE POLICY aptitude_sessions_select ON public.aptitude_game_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS aptitude_sessions_insert ON public.aptitude_game_sessions;
CREATE POLICY aptitude_sessions_insert ON public.aptitude_game_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS aptitude_sessions_update ON public.aptitude_game_sessions;
CREATE POLICY aptitude_sessions_update ON public.aptitude_game_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true);
