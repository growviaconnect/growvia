-- Add mentor onboarding columns to the mentors table.
-- Uses ADD COLUMN IF NOT EXISTS so this is safe to re-run.

ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS job_title          TEXT,
  ADD COLUMN IF NOT EXISTS company            TEXT,
  ADD COLUMN IF NOT EXISTS industry           TEXT,
  ADD COLUMN IF NOT EXISTS years_experience   TEXT,
  ADD COLUMN IF NOT EXISTS seniority          TEXT,
  ADD COLUMN IF NOT EXISTS expertise          TEXT[],
  ADD COLUMN IF NOT EXISTS help_with          TEXT,
  ADD COLUMN IF NOT EXISTS languages          TEXT[],
  ADD COLUMN IF NOT EXISTS availability       TEXT,
  ADD COLUMN IF NOT EXISTS mentor_score       INTEGER,
  -- legacy fields kept for backward-compat with seed data
  ADD COLUMN IF NOT EXISTS location                TEXT,
  ADD COLUMN IF NOT EXISTS mentoring_experience    TEXT,
  ADD COLUMN IF NOT EXISTS motivation              TEXT,
  ADD COLUMN IF NOT EXISTS session_preferences     TEXT[],
  ADD COLUMN IF NOT EXISTS certification_willing   BOOLEAN,
  ADD COLUMN IF NOT EXISTS bio                     TEXT,
  ADD COLUMN IF NOT EXISTS recommended_price       INTEGER,
  ADD COLUMN IF NOT EXISTS match_score_override    INTEGER;
