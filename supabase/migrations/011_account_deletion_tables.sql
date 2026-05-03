-- Archive of deleted user accounts for compliance / audit purposes.
-- The snapshot column holds the full profile JSON at time of deletion.
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid,
  email            text,
  full_name        text,
  role             text,
  plan             text,
  created_at       timestamptz,
  deleted_at       timestamptz DEFAULT now(),
  reason           text        DEFAULT 'user_request',
  snapshot         jsonb
);

-- Security audit log for sensitive operations (account deletion, etc.)
CREATE TABLE IF NOT EXISTS public.security_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid,
  action     text        NOT NULL,
  ip         text,
  user_agent text,
  meta       jsonb,
  created_at timestamptz DEFAULT now()
);

-- Only service role can access these tables — no public RLS policies needed.
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs    ENABLE ROW LEVEL SECURITY;

-- Pending balance for mentors (used by deletion flow to block until paid out)
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS pending_balance numeric(10,2) DEFAULT 0;
