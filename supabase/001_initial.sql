-- ============================================================
-- GrowVia — Initial database schema
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql
-- ============================================================

-- MENTORS
CREATE TABLE IF NOT EXISTS public.mentors (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  specialite TEXT,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MENTEES
CREATE TABLE IF NOT EXISTS public.mentees (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  objectif   TEXT,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONNEXIONS
CREATE TABLE IF NOT EXISTS public.connexions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id  UUID        REFERENCES public.mentors(id) ON DELETE SET NULL,
  mentee_id  UUID        REFERENCES public.mentees(id) ON DELETE SET NULL,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'completed', 'cancelled')),
  date       TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.mentors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connexions ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT (registration forms)
CREATE POLICY "anon_insert_mentors"  ON public.mentors    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_mentees"  ON public.mentees    FOR INSERT TO anon WITH CHECK (true);

-- Anon can SELECT (admin page is protected client-side by password)
CREATE POLICY "anon_select_mentors"      ON public.mentors    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_mentees"      ON public.mentees    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_connexions"   ON public.connexions FOR SELECT TO anon USING (true);
