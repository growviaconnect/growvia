-- Add proposed date/time columns to sessions (used when mentor proposes a new time)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS proposed_date text,
  ADD COLUMN IF NOT EXISTS proposed_time text;
