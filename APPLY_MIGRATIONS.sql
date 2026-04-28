-- ============================================================
-- GrowVia — Complete schema setup (safe to re-run)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/txpibvjktfltowjmvvmg/sql
-- ============================================================

-- ── Create tables if they don't exist ────────────────────────

CREATE TABLE IF NOT EXISTS public.mentors (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  specialite TEXT,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentees (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  objectif   TEXT,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.connexions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id  UUID        REFERENCES public.mentors(id) ON DELETE SET NULL,
  mentee_id  UUID        REFERENCES public.mentees(id) ON DELETE SET NULL,
  statut     TEXT        DEFAULT 'pending'
               CHECK (statut IN ('pending', 'active', 'completed', 'cancelled')),
  date       TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mentors: onboarding columns ───────────────────────────────
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS job_title            TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS company              TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS industry             TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS years_experience     TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS seniority            TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS expertise            TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS help_with            TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS languages            TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS availability         TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS mentor_score         INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS session_price        INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- ── Mentors: admin / legacy columns ──────────────────────────
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS certification_statut  TEXT DEFAULT 'none';
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS actif                 BOOLEAN DEFAULT true;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS location              TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS mentoring_experience  TEXT;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS session_preferences   TEXT[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS certification_willing BOOLEAN;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS recommended_price     INTEGER;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS match_score_override  INTEGER;

-- ── Mentors: profile + survey columns (migration 007) ────────
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS photo_url            text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS bio                  text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS localisation         text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS poste_actuel         text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS entreprise           text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS annees_experience    int;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS secteurs             text[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS competences          jsonb;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS type_profils_aides   text[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS style_mentorat       text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS disponibilite_heures int;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS max_mentees          int;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS langues              text[];
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS cv_url               text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS linkedin_url         text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS motivation           text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS format_prefere       text;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS survey_completed     boolean DEFAULT false;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS updated_at           timestamp DEFAULT now();

-- ── Mentees: base onboarding columns ─────────────────────────
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS actif                boolean DEFAULT true;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS age_range            text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS situation            text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS field                text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS main_goal            text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS interests            text[];
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS clarity_level        int;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS description          text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS has_used_free_ai_match boolean NOT NULL DEFAULT false;

-- ── Mentees: profile + survey columns (migration 007) ────────
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS photo_url            text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS bio                  text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS localisation         text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS objectif_principal   text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS secteurs_vises       text[];
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS poste_cible          text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS horizon_temporel     text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS niveau_etudes        text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS ecole                text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS experiences          text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS style_apprentissage  text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS frequence_souhaitee  text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS format_prefere       text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS langues              text[];
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS competences          jsonb;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS cv_url               text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS linkedin_url         text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS motivation           text;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS survey_completed     boolean DEFAULT false;
ALTER TABLE public.mentees ADD COLUMN IF NOT EXISTS updated_at           timestamp DEFAULT now();

-- ── Enable RLS ────────────────────────────────────────────────
ALTER TABLE public.mentors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connexions ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies (drop + recreate for idempotency) ────────────
DROP POLICY IF EXISTS "anon_insert_mentors"            ON public.mentors;
DROP POLICY IF EXISTS "anon_select_mentors"            ON public.mentors;
DROP POLICY IF EXISTS "anon_update_mentors"            ON public.mentors;
DROP POLICY IF EXISTS "authenticated_insert_mentors"   ON public.mentors;
DROP POLICY IF EXISTS "authenticated_select_mentors"   ON public.mentors;
DROP POLICY IF EXISTS "authenticated_update_mentors"   ON public.mentors;

DROP POLICY IF EXISTS "anon_insert_mentees"            ON public.mentees;
DROP POLICY IF EXISTS "anon_select_mentees"            ON public.mentees;
DROP POLICY IF EXISTS "anon_update_mentees"            ON public.mentees;
DROP POLICY IF EXISTS "authenticated_insert_mentees"   ON public.mentees;
DROP POLICY IF EXISTS "authenticated_select_mentees"   ON public.mentees;
DROP POLICY IF EXISTS "authenticated_update_mentees"   ON public.mentees;

DROP POLICY IF EXISTS "anon_select_connexions"         ON public.connexions;
DROP POLICY IF EXISTS "anon_update_connexions"         ON public.connexions;
DROP POLICY IF EXISTS "authenticated_select_connexions" ON public.connexions;
DROP POLICY IF EXISTS "authenticated_update_connexions" ON public.connexions;

CREATE POLICY "anon_insert_mentors"           ON public.mentors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_mentors"           ON public.mentors FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_mentors"           ON public.mentors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_insert_mentors"  ON public.mentors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_select_mentors"  ON public.mentors FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_mentors"  ON public.mentors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_insert_mentees"           ON public.mentees FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_mentees"           ON public.mentees FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_mentees"           ON public.mentees FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_insert_mentees"  ON public.mentees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_select_mentees"  ON public.mentees FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_mentees"  ON public.mentees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_connexions"            ON public.connexions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_connexions"            ON public.connexions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_connexions"   ON public.connexions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_connexions"   ON public.connexions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
