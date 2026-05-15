-- Remove moderate load-test seed only (local / staging).
-- Tag: tf_requests.title LIKE '[SEED-LOADTEST] TF요청%', senior_profiles.display_name LIKE '[SEED] QA시니어 %'.
-- Optional QA: emanitri@gmail.com (see supabase/seeds/qa/emanitri.sql).
-- Deleting matching tf_requests cascades to request_matches, proposals, contracts, settlements, contract_reviews.
DELETE FROM public.tf_requests
WHERE title LIKE '[SEED-LOADTEST] TF요청%';

DELETE FROM public.tf_requests
WHERE title LIKE '[SEED-EMANITRI] %';

DELETE FROM public.senior_profiles
WHERE display_name LIKE '[SEED] QA시니어 %';

DELETE FROM public.senior_profiles
WHERE display_name = '[SEED-EMANITRI] 시니어 Eman';
