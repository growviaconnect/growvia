-- 009_mentor_availability.sql
-- Weekly availability slots for mentors + pause_bookings flag on mentors table

CREATE TABLE IF NOT EXISTS mentor_availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id    uuid NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week  smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, day_of_week, start_time)
);

ALTER TABLE mentors ADD COLUMN IF NOT EXISTS pause_bookings boolean NOT NULL DEFAULT false;

ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can read availability (needed for booking flows)
CREATE POLICY "mentor_availability_public_read" ON mentor_availability
  FOR SELECT USING (true);

-- Mentors can manage their own slots
CREATE POLICY "mentor_availability_self_write" ON mentor_availability
  FOR ALL
  USING (
    mentor_id IN (
      SELECT id FROM mentors WHERE email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    mentor_id IN (
      SELECT id FROM mentors WHERE email = (auth.jwt() ->> 'email')
    )
  );
