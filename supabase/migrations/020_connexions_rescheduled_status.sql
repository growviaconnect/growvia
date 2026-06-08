-- 020_connexions_rescheduled_status.sql
-- Critical fix: the statut CHECK constraint was missing 'rescheduled', causing
-- every mentor "Propose new time" action to fail with a constraint violation.
-- Also adds proposed_date/proposed_time columns to connexions so the
-- accept-retime route can read the proposed time without a cross-table lookup.

-- Drop the old CHECK and recreate it with 'rescheduled' included.
ALTER TABLE public.connexions
  DROP CONSTRAINT IF EXISTS connexions_statut_check;

ALTER TABLE public.connexions
  ADD CONSTRAINT connexions_statut_check
  CHECK (statut IN ('pending', 'active', 'completed', 'cancelled', 'rescheduled'));

-- Proposed time columns (mirrored from sessions for simpler lookups)
ALTER TABLE public.connexions
  ADD COLUMN IF NOT EXISTS proposed_date TEXT;

ALTER TABLE public.connexions
  ADD COLUMN IF NOT EXISTS proposed_time TEXT;

-- Signal PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
