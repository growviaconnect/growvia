-- 021_mentee_subscriptions_and_fixes.sql
-- Formalises the mentee_subscriptions table schema, fixes sessions.status
-- CHECK constraint to include 'paid', and adds indexes.
-- Safe to run on both a fresh DB and one that already has the table.

-- ── 1. Fix sessions.status CHECK constraint to include 'paid' ──────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.sessions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.sessions DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'paid'));

-- ── 2. mentee_subscriptions table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentee_subscriptions (
  id                     UUID        NOT NULL DEFAULT gen_random_uuid(),
  mentee_id              UUID        NOT NULL,
  plan                   TEXT,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  status                 TEXT        NOT NULL DEFAULT 'active',
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mentee_subscriptions_pkey' AND conrelid = 'public.mentee_subscriptions'::regclass
  ) THEN
    ALTER TABLE public.mentee_subscriptions ADD PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mentee_subscriptions_mentee_id_fkey'
  ) THEN
    ALTER TABLE public.mentee_subscriptions
      ADD CONSTRAINT mentee_subscriptions_mentee_id_fkey
      FOREIGN KEY (mentee_id) REFERENCES public.mentees(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mentee_subscriptions_mentee_id_key'
  ) THEN
    ALTER TABLE public.mentee_subscriptions ADD UNIQUE (mentee_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mentee_subscriptions_status_check'
  ) THEN
    ALTER TABLE public.mentee_subscriptions
      ADD CONSTRAINT mentee_subscriptions_status_check
      CHECK (status IN ('active', 'cancelled', 'trialing', 'past_due', 'incomplete'));
  END IF;
END $$;

ALTER TABLE public.mentee_subscriptions ADD COLUMN IF NOT EXISTS plan                   TEXT;
ALTER TABLE public.mentee_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT;
ALTER TABLE public.mentee_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.mentee_subscriptions ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ;

-- ── 3. RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.mentee_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_mentee_subscriptions" ON public.mentee_subscriptions;
DROP POLICY IF EXISTS "authenticated_insert_mentee_subscriptions" ON public.mentee_subscriptions;
DROP POLICY IF EXISTS "authenticated_update_mentee_subscriptions" ON public.mentee_subscriptions;

CREATE POLICY "authenticated_select_mentee_subscriptions"
  ON public.mentee_subscriptions FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_mentee_subscriptions"
  ON public.mentee_subscriptions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_mentee_subscriptions"
  ON public.mentee_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ── 4. Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS mentee_subscriptions_mentee_id_status_idx
  ON public.mentee_subscriptions (mentee_id, status);

CREATE INDEX IF NOT EXISTS mentee_subscriptions_stripe_customer_id_idx
  ON public.mentee_subscriptions (stripe_customer_id);

CREATE INDEX IF NOT EXISTS mentee_subscriptions_stripe_subscription_id_idx
  ON public.mentee_subscriptions (stripe_subscription_id);

NOTIFY pgrst, 'reload schema';
