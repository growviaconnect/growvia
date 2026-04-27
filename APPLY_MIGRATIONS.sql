-- ============================================================
-- GrowVia Complete Mentors Table Schema
-- Run this in the Supabase SQL Editor to ensure all columns exist:
-- https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql
-- ============================================================

-- Create mentors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mentors (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  specialite TEXT,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all onboarding and business columns (safe to re-run)
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS job_title          TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS company            TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS industry           TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS years_experience   TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS seniority          TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS expertise          TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS help_with          TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS languages          TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS availability       TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS mentor_score       INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS session_price      INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add admin/legacy columns
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS certification_statut TEXT DEFAULT 'none';
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS location                TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS mentoring_experience    TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS motivation              TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS session_preferences     TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS certification_willing   BOOLEAN;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS bio                     TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS recommended_price       INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS match_score_override    INTEGER;

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- RLS Policies (safe to re-run)
DROP POLICY IF EXISTS "anon_insert_mentors" ON public.mentors;
DROP POLICY IF EXISTS "anon_select_mentors" ON public.mentors;
DROP POLICY IF EXISTS "anon_update_mentors" ON public.mentors;
DROP POLICY IF EXISTS "authenticated_insert_mentors" ON public.mentors;
DROP POLICY IF EXISTS "authenticated_select_mentors" ON public.mentors;
DROP POLICY IF EXISTS "authenticated_update_mentors" ON public.mentors;

CREATE POLICY "anon_insert_mentors" ON public.mentors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_mentors" ON public.mentors FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_mentors" ON public.mentors FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_insert_mentors" ON public.mentors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_select_mentors" ON public.mentors FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_mentors" ON public.mentors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
