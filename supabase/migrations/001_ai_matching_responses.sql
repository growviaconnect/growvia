-- ============================================================
-- Run this entire script in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Free-trial flag on mentees
ALTER TABLE public.mentees
  ADD COLUMN IF NOT EXISTS has_used_free_ai_match boolean NOT NULL DEFAULT false;

-- 2. Fixed display-score override on mentors (used by demo/showcase mentors)
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS match_score_override integer;

-- 3. AI matching responses table
CREATE TABLE IF NOT EXISTS public.ai_matching_responses (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text,
  role               text,
  main_goals         text[],
  industry           text,
  mentor_priorities  text[],
  experience_level   text,
  preferred_language text,
  meeting_frequency  text,
  free_text          text,
  attempt_number     integer     NOT NULL DEFAULT 1,
  match_results      jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_matching_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_ai_responses"
  ON public.ai_matching_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_ai_responses"
  ON public.ai_matching_responses
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Seed 3 demo mentors (idempotent — skips if email already exists)
INSERT INTO public.mentors
  (nom, email, specialite, statut, certification_statut, actif,
   job_title, industry, years_experience, seniority,
   expertise, languages, location,
   mentor_score, recommended_price, bio,
   match_score_override)
SELECT v.nom, v.email, v.specialite, v.statut, v.certification_statut, v.actif,
       v.job_title, v.industry, v.years_experience, v.seniority,
       v.expertise, v.languages, v.location,
       v.mentor_score, v.recommended_price, v.bio,
       v.match_score_override
FROM (VALUES
  (
    'Lucas Bernard',
    'lucas.bernard@growvia.demo',
    'Growth & Startup Advisor',
    'active', 'none', true,
    'Growth & Startup Advisor', 'Entrepreneurship', '10', 'Senior',
    ARRAY['Growth Hacking','Startup Strategy','Fundraising','Product-Market Fit','Go-to-Market']::text[],
    ARRAY['French','English']::text[],
    'Paris, France',
    90, 80,
    'Serial entrepreneur with 10 years helping startups scale from 0 to €10M ARR. Ex-operator at 3 funded startups.',
    91
  ),
  (
    'Sofia Martínez',
    'sofia.martinez@growvia.demo',
    'Digital Marketing Strategist',
    'active', 'none', true,
    'Digital Marketing Strategist', 'Marketing', '8', 'Senior',
    ARRAY['Digital Marketing','SEO','Paid Ads','Content Strategy','Social Media']::text[],
    ARRAY['Spanish','English','French']::text[],
    'Madrid, Spain',
    80, 60,
    '8 years building digital marketing strategies for brands across Europe. Ex-Head of Growth at a Series B SaaS.',
    85
  ),
  (
    'Amira Benali',
    'amira.benali@growvia.demo',
    'Brand & Social Media Expert',
    'active', 'none', true,
    'Brand & Social Media Expert', 'Marketing', '6', 'Mid-level',
    ARRAY['Brand Strategy','Social Media','Content Creation','Community Management','Influencer Marketing']::text[],
    ARRAY['French','Arabic','English']::text[],
    'Barcelona, Spain',
    70, 45,
    '6 years crafting brand identities and social media strategies for consumer brands and startups.',
    78
  )
) AS v(nom, email, specialite, statut, certification_statut, actif,
       job_title, industry, years_experience, seniority,
       expertise, languages, location,
       mentor_score, recommended_price, bio,
       match_score_override)
WHERE NOT EXISTS (
  SELECT 1 FROM public.mentors WHERE email = v.email
);
