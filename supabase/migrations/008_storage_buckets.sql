-- Create storage buckets used by the mentor onboarding flow.
-- Run once in Supabase → SQL Editor.

-- avatars: public (profile photos shown everywhere)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- cvs: private (only accessible via signed URL or service-role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS must be enabled — enable it if not already on
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- avatars policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY avatars_public_read ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_auth_write'
  ) THEN
    CREATE POLICY avatars_auth_write ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'avatars');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_auth_update'
  ) THEN
    CREATE POLICY avatars_auth_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'avatars');
  END IF;
END $$;

-- cvs policies (owner-scoped: path starts with user id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'cvs_owner_insert'
  ) THEN
    CREATE POLICY cvs_owner_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'cvs'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'cvs_owner_select'
  ) THEN
    CREATE POLICY cvs_owner_select ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'cvs'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'cvs_owner_update'
  ) THEN
    CREATE POLICY cvs_owner_update ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'cvs'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
