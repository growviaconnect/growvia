-- ─────────────────────────────────────────────────────────────────────────────
-- ADD_PROFILE_COLUMNS.sql
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Safe to re-run: all statements use IF NOT EXISTS
-- ─────────────────────────────────────────────────────────────────────────────

-- ── mentors ──────────────────────────────────────────────────────────────────
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS photo_url            text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS bio                  text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS localisation         text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS poste_actuel         text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS entreprise           text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS annees_experience    int;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS secteurs             text[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS competences          jsonb;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS type_profils_aides   text[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS style_mentorat       text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS disponibilite_heures int;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS max_mentees          int;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS langues              text[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS cv_url               text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS linkedin_url         text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS motivation           text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS format_prefere       text;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS survey_completed     boolean   DEFAULT false;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS updated_at           timestamp DEFAULT now();

-- ── mentees ──────────────────────────────────────────────────────────────────
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS photo_url            text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS bio                  text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS localisation         text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS objectif_principal   text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS secteurs_vises       text[];
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS poste_cible          text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS horizon_temporel     text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS niveau_etudes        text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS ecole                text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS experiences          text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS style_apprentissage  text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS frequence_souhaitee  text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS format_prefere       text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS langues              text[];
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS competences          jsonb;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS cv_url               text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS linkedin_url         text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS motivation           text;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS survey_completed     boolean   DEFAULT false;
ALTER TABLE mentees ADD COLUMN IF NOT EXISTS updated_at           timestamp DEFAULT now();
