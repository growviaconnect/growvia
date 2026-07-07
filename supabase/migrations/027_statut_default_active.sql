-- Signup should NOT create pending rows anymore. Manual admin validation is
-- gone; the only remaining "you can't act yet" gate is the auth.users
-- email_confirmed_at check enforced at login time. Any new row inserted
-- without an explicit statut lands in the "active" bucket.

ALTER TABLE public.mentors ALTER COLUMN statut SET DEFAULT 'active';
ALTER TABLE public.mentees ALTER COLUMN statut SET DEFAULT 'active';

-- Trim any accidental CR/LF suffixes that snuck in via a legacy Windows-line-ending insert.
UPDATE public.mentors SET statut = TRIM(BOTH E'\r\n\t ' FROM statut) WHERE statut ~ '[\r\n\t ]';
UPDATE public.mentees SET statut = TRIM(BOTH E'\r\n\t ' FROM statut) WHERE statut ~ '[\r\n\t ]';
