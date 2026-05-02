-- TBS Education is headquartered in Toulouse, not Barcelona.
UPDATE mentees
SET ecole = 'TBS Education (Toulouse)'
WHERE ecole ILIKE '%TBS%' AND ecole ILIKE '%barcelona%';
