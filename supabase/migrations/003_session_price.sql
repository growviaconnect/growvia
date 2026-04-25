-- Add session_price column: the price the mentor chose during onboarding
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS session_price INTEGER;
