-- ============================================================
-- GrowVia — Admin features migration
-- Run this in the Supabase SQL Editor AFTER 001_initial.sql:
-- https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql
-- ============================================================

-- Add certification status to mentors
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS certification_statut TEXT DEFAULT 'none'
    CHECK (certification_statut IN ('none', 'pending', 'certified', 'rejected'));

-- Add active flag to mentors and mentees
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true;

-- AI MATCHINGS
CREATE TABLE IF NOT EXISTS public.ai_matchings (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id  UUID        REFERENCES public.mentors(id) ON DELETE SET NULL,
  mentee_id  UUID        REFERENCES public.mentees(id) ON DELETE SET NULL,
  score      NUMERIC(5,2),
  statut     TEXT        DEFAULT 'active'
               CHECK (statut IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_matchings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_matchings
CREATE POLICY "anon_select_ai_matchings" ON public.ai_matchings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_ai_matchings" ON public.ai_matchings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_ai_matchings" ON public.ai_matchings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon UPDATE on mentors, mentees, connexions (for admin actions)
CREATE POLICY "anon_update_mentors"    ON public.mentors    FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_update_mentees"    ON public.mentees    FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_update_connexions" ON public.connexions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_connexions" ON public.connexions FOR INSERT TO anon WITH CHECK (true);
