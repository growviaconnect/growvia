-- ============================================================
-- Run this entire script in Supabase → SQL Editor → New query
-- ============================================================

-- New columns for mentor onboarding v2
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS company                text,
  ADD COLUMN IF NOT EXISTS help_with              text,
  ADD COLUMN IF NOT EXISTS recommended_price_min  integer,
  ADD COLUMN IF NOT EXISTS recommended_price_max  integer,
  ADD COLUMN IF NOT EXISTS session_price          integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_schedule  jsonb;
