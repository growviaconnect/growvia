-- Workspace tables + storage bucket + presence tracking.

-- ── Assignments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  connexion_id          uuid        REFERENCES public.connexions(id) ON DELETE CASCADE,
  mentor_id             uuid        REFERENCES public.mentors(id)    ON DELETE SET NULL,
  mentee_id             uuid        REFERENCES public.mentees(id)    ON DELETE SET NULL,
  title                 text        NOT NULL,
  description           text,
  due_date              date,
  status                text        NOT NULL DEFAULT 'pending',
  file_url              text,
  response_file_url     text,
  response_file_name    text,
  response_submitted_at timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assignments_connexion_id_idx ON public.assignments(connexion_id);
CREATE INDEX IF NOT EXISTS assignments_mentee_id_idx    ON public.assignments(mentee_id);
CREATE INDEX IF NOT EXISTS assignments_mentor_id_idx    ON public.assignments(mentor_id);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assignments_authenticated_all ON public.assignments;
CREATE POLICY assignments_authenticated_all ON public.assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  connexion_id   uuid        REFERENCES public.connexions(id) ON DELETE CASCADE,
  sender_id      uuid,
  sender_email   text        NOT NULL,
  sender_nom     text,
  receiver_email text,
  content        text        NOT NULL,
  read_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_connexion_id_idx  ON public.messages(connexion_id);
CREATE INDEX IF NOT EXISTS messages_receiver_read_idx ON public.messages(receiver_email) WHERE read_at IS NULL;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_authenticated_all ON public.messages;
CREATE POLICY messages_authenticated_all ON public.messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Publish to realtime so clients can subscribe to INSERTs
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ── Presence (last active timestamp) ────────────────────────────────────────
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS last_active_at timestamptz;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- ── Storage bucket for mentee assignment responses ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS assignment_files_authenticated_all ON storage.objects;
CREATE POLICY assignment_files_authenticated_all ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'assignment-files')
  WITH CHECK (bucket_id = 'assignment-files');
