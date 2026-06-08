-- 019_connexions_missing_columns.sql
-- Ensures all columns referenced by the sessions/create and sessions/accept
-- routes exist on connexions. Safe to re-run (IF NOT EXISTS).
--
-- Root cause: connexions table may have been created without 'date' (or other
-- columns) if the production DB was seeded from a schema that differed from
-- 001_initial.sql. PGRST204 ("Could not find the 'date' column") is thrown by
-- PostgREST when the column is missing from its schema cache.

ALTER TABLE public.connexions
  ADD COLUMN IF NOT EXISTS date       TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.connexions
  ADD COLUMN IF NOT EXISTS topic      TEXT;

ALTER TABLE public.connexions
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Reload the PostgREST schema cache so the new columns are visible immediately.
-- (Supabase exposes this via the pg_notify mechanism.)
NOTIFY pgrst, 'reload schema';
