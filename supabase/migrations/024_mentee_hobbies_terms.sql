-- Mentee onboarding additions: hobbies tags + Terms acceptance timestamp.
-- Mirrors migration 023 for the mentors table.

ALTER TABLE public.mentees
  ADD COLUMN IF NOT EXISTS hobbies           TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
