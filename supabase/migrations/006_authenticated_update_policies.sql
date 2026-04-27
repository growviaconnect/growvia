-- Grant the authenticated role the same broad access as anon.
-- Without this, users who signed in via Supabase Auth are blocked from updating
-- their own mentor/mentee records during onboarding (RLS only had anon policies).

CREATE POLICY IF NOT EXISTS "authenticated_select_mentors"
  ON public.mentors FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_insert_mentors"
  ON public.mentors FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "authenticated_update_mentors"
  ON public.mentors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "authenticated_select_mentees"
  ON public.mentees FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_insert_mentees"
  ON public.mentees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "authenticated_update_mentees"
  ON public.mentees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "authenticated_select_connexions"
  ON public.connexions FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_update_connexions"
  ON public.connexions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
