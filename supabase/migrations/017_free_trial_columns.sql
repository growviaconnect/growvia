-- 017_free_trial_columns.sql
-- Adds explicit per-flag trial tracking columns that replace the old generic names.
--   free_discovery_used  replaces  free_session_used
--   free_ai_match_used   replaces  has_used_free_ai_match
-- Safe to re-run (IF NOT EXISTS / no-op UPDATEs).

ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS free_discovery_used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS free_ai_match_used   BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing data so no trial is silently re-granted
UPDATE public.mentees
  SET free_discovery_used = true
  WHERE COALESCE(free_session_used, false) = true
    AND free_discovery_used = false;

UPDATE public.mentees
  SET free_ai_match_used = true
  WHERE COALESCE(has_used_free_ai_match, false) = true
    AND free_ai_match_used = false;
