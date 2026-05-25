CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid REFERENCES public.mentors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 0=Monday, 6=Sunday
  period text NOT NULL, -- 'morning', 'afternoon', 'evening'
  created_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, day_of_week, period)
);

ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage their own availability"
ON public.mentor_availability
FOR ALL USING (
  mentor_id IN (
    SELECT id FROM public.mentors WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view mentor availability"
ON public.mentor_availability
FOR SELECT USING (true);
