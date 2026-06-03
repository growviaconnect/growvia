-- Allow authenticated users to insert their own connexion requests.
-- Without this, authenticated sessions (JWT-scoped anon key) could be blocked
-- depending on Supabase's RLS evaluation order for the authenticated role.
-- The anon_insert_connexions policy (002_admin_features.sql) covers anon role;
-- this covers the authenticated role so both paths work.
CREATE POLICY IF NOT EXISTS "authenticated_insert_connexions"
  ON public.connexions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
