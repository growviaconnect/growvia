-- Track when the mentee has "seen" an assignment so we can clear the
-- Workspace sidebar badge the moment they open the tab, rather than
-- waiting for them to actually submit a response.

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS seen_at timestamptz;

CREATE INDEX IF NOT EXISTS assignments_mentee_unseen_idx
  ON public.assignments(mentee_id) WHERE seen_at IS NULL;
