-- 016_sessions_table.sql
-- Creates the sessions table with full schema and RLS policies.
-- Safe to re-run: all statements use IF NOT EXISTS / DROP IF EXISTS.

CREATE TABLE IF NOT EXISTS public.sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id         UUID        REFERENCES public.mentors(id) ON DELETE SET NULL,
  mentee_id         UUID        REFERENCES public.mentees(id) ON DELETE SET NULL,
  mentee_email      TEXT,
  topic             TEXT,
  date              TEXT,
  time              TEXT,
  language          TEXT,
  duration_minutes  INTEGER     DEFAULT 60,
  price_cents       INTEGER,
  status            TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled')),
  meet_link         TEXT,
  stripe_session_id TEXT,
  payment_intent_id TEXT,
  proposed_date     TEXT,
  proposed_time     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent: add columns that may be missing in older manually-created schemas
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS mentee_email      TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS language          TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS price_cents       INTEGER;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS proposed_date     TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS proposed_time     TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS meet_link         TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS duration_minutes  INTEGER;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS topic             TEXT;

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies for idempotency
DROP POLICY IF EXISTS "anon_insert_sessions"          ON public.sessions;
DROP POLICY IF EXISTS "anon_select_sessions"          ON public.sessions;
DROP POLICY IF EXISTS "authenticated_insert_sessions" ON public.sessions;
DROP POLICY IF EXISTS "authenticated_select_sessions" ON public.sessions;
DROP POLICY IF EXISTS "authenticated_update_sessions" ON public.sessions;

-- Anon: insert (booking form is accessible before login) + select
CREATE POLICY "anon_insert_sessions"
  ON public.sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_sessions"
  ON public.sessions FOR SELECT TO anon USING (true);

-- Authenticated: insert, select, update (for cancellation)
CREATE POLICY "authenticated_insert_sessions"
  ON public.sessions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_select_sessions"
  ON public.sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_update_sessions"
  ON public.sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS sessions_mentee_id_idx          ON public.sessions (mentee_id);
CREATE INDEX IF NOT EXISTS sessions_mentor_id_idx          ON public.sessions (mentor_id);
CREATE INDEX IF NOT EXISTS sessions_payment_intent_id_idx  ON public.sessions (payment_intent_id);
