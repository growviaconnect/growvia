-- Mentor onboarding additions: hobbies tags + Terms acceptance timestamp.

ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS hobbies           TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
