-- Sessions: add payment tracking + mentee email for quick lookup
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS mentee_email       text;

-- Index for webhook lookups by payment_intent_id
CREATE INDEX IF NOT EXISTS sessions_payment_intent_id_idx
  ON public.sessions (payment_intent_id);
