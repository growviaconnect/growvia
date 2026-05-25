-- Add payment and language tracking columns to sessions table
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS language         text,
  ADD COLUMN IF NOT EXISTS price_cents      integer,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;
