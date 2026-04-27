-- Reset mentor accounts created before onboarding was implemented.
-- Clears all questionnaire responses and marks onboarding as incomplete
-- so these mentors are redirected through the full onboarding flow on next login.
UPDATE public.mentors
SET
  onboarding_completed = false,
  job_title            = NULL,
  company              = NULL,
  industry             = NULL,
  years_experience     = NULL,
  seniority            = NULL,
  expertise            = NULL,
  help_with            = NULL,
  languages            = NULL,
  availability         = NULL,
  mentor_score         = NULL,
  session_price        = NULL,
  statut               = 'pending'
WHERE email = 'lala@lala.fr';
