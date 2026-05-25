-- Add meet_link column to connexions so the dashboard can display Join buttons
ALTER TABLE public.connexions ADD COLUMN IF NOT EXISTS meet_link text;
