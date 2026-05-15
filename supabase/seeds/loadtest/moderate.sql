-- Moderate load-test seed (local / staging only)
-- Standard volumes: +50 senior_profiles, 40 tf_requests, 40 request_matches, 40 proposals,
-- 10 contracts, 10 settlements, 5 contract_reviews (see docs/db-rls.md)
--
-- Prerequisites: at least one row in public.companies (e.g. after one company signup).
-- Run in SQL Editor (DB owner) or: psql "$DATABASE_URL" -f supabase/seeds/loadtest/moderate.sql
-- RLS: senior_profiles has no INSERT for `authenticated`; use postgres / service role context.
-- Re-runnable: removes prior seed rows by tag, then inserts again.
-- Senior pool rows: richer headline / fields / regions (지원자 풀 품질 보강).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
    RAISE EXCEPTION 'loadtest_moderate: public.companies is empty — create a company account first.';
  END IF;
END;
$$;

BEGIN;

-- Remove previous seed (FK order: children cascade from tf_requests / proposals)
DELETE FROM public.tf_requests
WHERE title LIKE '[SEED-LOADTEST] TF요청%';

DELETE FROM public.senior_profiles
WHERE display_name LIKE '[SEED] QA시니어 %';

-- A: +50 seniors (지원자 풀 — 분야·지역·헤드라인 다양화)
INSERT INTO public.senior_profiles (display_name, headline, fields, region, years_experience)
SELECT
  '[SEED] QA시니어 ' || lpad(g::text, 3, '0'),
  CASE (g - 1) % 10
    WHEN 0 THEN '대기업 CFO 출신 · 상장 재무·자금 총괄 · 단기 TF 가능'
    WHEN 1 THEN '글로벌 전략·PMO 리드 · 제조 DX 및 공급망 개선'
    WHEN 2 THEN 'HRD·조직문화 · 코칭 500회+ · 평가·GR 체계 설계'
    WHEN 3 THEN '해외영업·채널 · 동남아 거점 개척·유통 협상'
    WHEN 4 THEN 'IT 아키텍처·보안 감사 · 클라우드 전환 PM'
    WHEN 5 THEN 'M&A·재무실사 · 딜룸 자문 및 PMI 로드맵'
    WHEN 6 THEN '데이터 거버넌스·BI · 경영 리포팅 자동화'
    WHEN 7 THEN 'ESG 공시·탄소회계 · 이사회 보고 체계'
    WHEN 8 THEN '법무·컴플라이언스 · 계약서 표준화'
    ELSE '마케팅·그로스 · B2B 리드 퍼널 최적화'
  END,
  CASE (g - 1) % 10
    WHEN 0 THEN array['재무', 'M&A', 'IR']::text[]
    WHEN 1 THEN array['전략', 'PMO', 'DX']::text[]
    WHEN 2 THEN array['HR', '조직문화', '리더십']::text[]
    WHEN 3 THEN array['영업', '유통', '해외']::text[]
    WHEN 4 THEN array['IT', '보안', '아키텍처']::text[]
    WHEN 5 THEN array['재무', '자금', '내부회계']::text[]
    WHEN 6 THEN array['데이터', 'BI', '거버넌스']::text[]
    WHEN 7 THEN array['ESG', '공시', '탄소']::text[]
    WHEN 8 THEN array['법무', '컴플라이언스', '계약']::text[]
    ELSE array['마케팅', '그로스', 'B2B']::text[]
  END,
  CASE (g - 1) % 8
    WHEN 0 THEN '서울'
    WHEN 1 THEN '경기'
    WHEN 2 THEN '부산'
    WHEN 3 THEN '대전'
    WHEN 4 THEN '광주'
    WHEN 5 THEN '세종'
    WHEN 6 THEN '울산'
    ELSE '인천'
  END,
  18 + ((g - 1) % 25)
FROM generate_series(1, 50) AS g;

-- B: 40 TF requests (single company: oldest by created_at)
INSERT INTO public.tf_requests (
  company_id,
  title,
  field,
  duration_weeks,
  budget_min,
  budget_max,
  goals,
  region,
  status
)
SELECT
  (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1),
  '[SEED-LOADTEST] TF요청 ' || lpad(g::text, 3, '0'),
  (array['재무', '전략', 'HR', 'IT', '영업'])[1 + ((g - 1) % 5)],
  4 + ((g - 1) % 12),
  1000000 + (g * 100000),
  5000000 + (g * 500000),
  '[SEED-LOADTEST] 목표 설명 ' || g::text || ' — MVP 부하 테스트용 더미 문장입니다.',
  (array['서울', '경기', '부산'])[1 + ((g - 1) % 3)],
  (array['open', 'open', 'matching', 'in_progress']::public.request_status[])[1 + ((g - 1) % 4)]
FROM generate_series(1, 40) AS g;

-- C: 40 matches (request row n ↔ senior row ((n-1) % 50) + 1)
INSERT INTO public.request_matches (request_id, senior_id, fit_score, match_reasons)
SELECT
  r.id,
  s.id,
  LEAST(
    0.99::numeric,
    0.5::numeric + (((r.nr + s.rn) % 45))::numeric / 100
  ),
  array['키워드일치', '지역근접', '경력매칭']::text[]
FROM (
  SELECT id, row_number() OVER (ORDER BY id) AS nr
  FROM public.tf_requests
  WHERE title LIKE '[SEED-LOADTEST] TF요청%'
) AS r
JOIN (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM public.senior_profiles
  WHERE display_name LIKE '[SEED] QA시니어 %'
) AS s
  ON s.rn = ((r.nr - 1) % 50) + 1;

-- D: 40 proposals — 22 pending, 10 accepted, 4 rejected, 4 withdrawn
INSERT INTO public.proposals (request_id, senior_id, fit_score, match_reasons, message, status)
SELECT
  rm.request_id,
  rm.senior_id,
  rm.fit_score,
  rm.match_reasons,
  '[SEED-LOADTEST] 제안 본문입니다.',
  CASE
    WHEN rm.n <= 22 THEN 'pending'::public.proposal_status
    WHEN rm.n <= 32 THEN 'accepted'::public.proposal_status
    WHEN rm.n <= 36 THEN 'rejected'::public.proposal_status
    ELSE 'withdrawn'::public.proposal_status
  END
FROM (
  SELECT
    m.request_id,
    m.senior_id,
    m.fit_score,
    m.match_reasons,
    row_number() OVER (ORDER BY m.request_id, m.senior_id) AS n
  FROM public.request_matches AS m
  INNER JOIN public.tf_requests AS tr ON tr.id = m.request_id
  WHERE tr.title LIKE '[SEED-LOADTEST] TF요청%'
) AS rm;

-- E: 10 contracts (first 10 accepted proposals)
INSERT INTO public.contracts (
  proposal_id,
  start_date,
  end_date,
  role_scope,
  compensation,
  status,
  progress
)
SELECT
  p.id,
  DATE '2026-06-01',
  DATE '2026-09-30',
  '[SEED-LOADTEST] 역할 범위 텍스트',
  30000000,
  CASE
    WHEN p.rn <= 5 THEN 'completed'::public.contract_status
    WHEN p.rn <= 8 THEN 'active'::public.contract_status
    ELSE 'draft'::public.contract_status
  END,
  CASE
    WHEN p.rn <= 5 THEN 100
    ELSE 45
  END
FROM (
  SELECT
    pr.id,
    row_number() OVER (ORDER BY pr.created_at, pr.id) AS rn
  FROM public.proposals AS pr
  INNER JOIN public.tf_requests AS tr ON tr.id = pr.request_id
  WHERE tr.title LIKE '[SEED-LOADTEST] TF요청%'
    AND pr.status = 'accepted'::public.proposal_status
) AS p
WHERE p.rn <= 10;

-- F: 10 settlements (1:1 with seeded contracts; status mix for UI)
INSERT INTO public.settlements (contract_id, amount, status)
SELECT
  s.contract_id,
  30000000,
  s.status
FROM (
  SELECT
    ct.id AS contract_id,
    CASE (row_number() OVER (ORDER BY ct.created_at, ct.id) % 4)
      WHEN 0 THEN 'held'::public.settlement_status
      WHEN 1 THEN 'pending'::public.settlement_status
      WHEN 2 THEN 'released'::public.settlement_status
      ELSE 'pending'::public.settlement_status
    END AS status
  FROM public.contracts AS ct
  INNER JOIN public.proposals AS pr ON pr.id = ct.proposal_id
  INNER JOIN public.tf_requests AS tf ON tf.id = pr.request_id
  WHERE tf.title LIKE '[SEED-LOADTEST] TF요청%'
) AS s;

-- G: 5 reviews on completed seeded contracts
INSERT INTO public.contract_reviews (contract_id, reviewer_id, senior_id, rating, comment)
SELECT
  x.contract_id,
  x.reviewer_id,
  x.senior_id,
  x.rating,
  x.comment
FROM (
  SELECT
    ct.id AS contract_id,
    co.owner_id AS reviewer_id,
    pr.senior_id,
    5::smallint AS rating,
    '[SEED-LOADTEST] 만족스러운 협업이었습니다. 추천합니다.'::text AS comment,
    row_number() OVER (ORDER BY ct.created_at, ct.id) AS rk
  FROM public.contracts AS ct
  INNER JOIN public.proposals AS pr ON pr.id = ct.proposal_id
  INNER JOIN public.tf_requests AS tf ON tf.id = pr.request_id
  INNER JOIN public.companies AS co ON co.id = tf.company_id
  WHERE tf.title LIKE '[SEED-LOADTEST] TF요청%'
    AND ct.status = 'completed'::public.contract_status
) AS x
WHERE x.rk <= 5;

COMMIT;
