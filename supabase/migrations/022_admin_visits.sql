-- Founder admin dashboard: track the last time each founder visited the dashboard,
-- so we can show "new since last visit" badges on counters.

CREATE TABLE IF NOT EXISTS public.admin_visits (
  email        TEXT PRIMARY KEY,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_visits ENABLE ROW LEVEL SECURITY;

-- A logged-in founder can read and upsert ONLY their own row, keyed by their JWT email.
DROP POLICY IF EXISTS admin_visits_select_own ON public.admin_visits;
CREATE POLICY admin_visits_select_own
  ON public.admin_visits
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS admin_visits_insert_own ON public.admin_visits;
CREATE POLICY admin_visits_insert_own
  ON public.admin_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS admin_visits_update_own ON public.admin_visits;
CREATE POLICY admin_visits_update_own
  ON public.admin_visits
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);
