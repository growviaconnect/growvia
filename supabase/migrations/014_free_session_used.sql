-- Track whether the mentee has used their one free discovery session.
-- Default false so all existing mentees start eligible (or set true if they
-- already have at least one session in the sessions table — handled below).
ALTER TABLE mentees
  ADD COLUMN IF NOT EXISTS free_session_used boolean NOT NULL DEFAULT false;

-- Retroactively mark existing mentees who already have sessions as having used it.
UPDATE mentees
SET free_session_used = true
WHERE id IN (
  SELECT DISTINCT mentee_id FROM sessions
);
