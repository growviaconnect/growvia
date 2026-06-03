-- reset_trial_flags_testing.sql
-- Resets all free-trial flags for a specific mentee so you can re-test the flow.
-- Run in Supabase SQL Editor. Replace the email with the test account email.
-- DO NOT run in production unless you intentionally want to re-grant trials.

UPDATE public.mentees
  SET free_discovery_used    = false,
      free_ai_match_used     = false,
      free_session_used      = false,
      has_used_free_ai_match = false
  WHERE email = 'growviaconnect@gmail.com';

-- Verify the reset
SELECT email, free_discovery_used, free_ai_match_used, free_session_used, has_used_free_ai_match
  FROM public.mentees
  WHERE email = 'growviaconnect@gmail.com';
