-- Allow authenticated users to insert their own connexion requests.
-- Without this, authenticated sessions (JWT-scoped anon key) could be blocked
-- depending on Supabase's RLS evaluation order for the authenticated role.
-- The anon_insert_connexions policy (002_admin_features.sql) covers anon role;
-- this covers the authenticated role so both paths work.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'connexions'
      AND policyname = 'authenticated_insert_connexions'
  ) THEN
    CREATE POLICY "authenticated_insert_connexions"
      ON public.connexions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
