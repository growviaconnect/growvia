ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
