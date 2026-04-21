-- AI Matching Responses
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS public.ai_matching_responses (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        text,
  role             text,
  main_goals       text[],
  industry         text,
  mentor_priorities text[],
  experience_level text,
  preferred_language text,
  meeting_frequency text,
  free_text        text,
  attempt_number   integer     NOT NULL DEFAULT 1,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_matching_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own responses
CREATE POLICY "users_insert_own_ai_responses"
  ON public.ai_matching_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own responses
CREATE POLICY "users_select_own_ai_responses"
  ON public.ai_matching_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Also run this if has_used_free_ai_match doesn't exist yet on mentees:
-- ALTER TABLE public.mentees
--   ADD COLUMN IF NOT EXISTS has_used_free_ai_match boolean NOT NULL DEFAULT false;
