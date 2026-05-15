-- QA: emanitri@gmail.com (local / staging). profiles.role 변경 없음.
-- Idempotent: DELETE tf_requests WHERE title LIKE '[SEED-EMANITRI] %' 후 재삽입.
-- Skip: NOTICE (auth 없음, profiles 없음, senior+companies 비어 있음, company+풀 없음).
-- Prerequisite: core_schema 마이그레이션 적용 후, SQL Editor 또는 psql (DB owner).

do $seed$
declare
  v_uid uuid;
  v_role text;
  v_sp_id uuid;
  v_cid uuid;
  v_req1 uuid;
  v_req2 uuid;
  v_req3 uuid;
  v_prop_acc uuid;
  v_contract_id uuid;
  pool1 uuid;
  pool2 uuid;
  pool3 uuid;
begin
  select au.id into v_uid from auth.users au where lower(trim(au.email)) = 'emanitri@gmail.com' limit 1;

  if v_uid is null then
    raise notice 'seed_emanitri: skip — no auth.users row for emanitri@gmail.com (sign up first).';
    return;
  end if;

  select p.role into v_role from public.profiles p where p.id = v_uid;

  if v_role is null then
    raise notice 'seed_emanitri: skip — no public.profiles row for this user.';
    return;
  end if;

  delete from public.tf_requests where title like '[SEED-EMANITRI] %';

  if v_role = 'senior' then
    insert into public.senior_profiles (display_name, headline, fields, region, years_experience, profile_id)
      values (
        '[SEED-EMANITRI] 시니어 Eman',
        '대기업 CFO·전략기획 출신 · 단기 TF·재무 due diligence 및 IR',
        array['재무', '전략', 'M&A', 'IR', 'DX']::text[],
        '서울',
        32,
        v_uid
      )
    on conflict (profile_id) do update set
      display_name = excluded.display_name,
      headline = excluded.headline,
      fields = excluded.fields,
      region = excluded.region,
      years_experience = excluded.years_experience;

    select sp.id into v_sp_id from public.senior_profiles sp where sp.profile_id = v_uid;

    select c.id into v_cid from public.companies c order by c.created_at asc limit 1;

    if v_cid is null then
      raise notice 'seed_emanitri: senior branch skip — public.companies is empty (create a company account first).';
      return;
    end if;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] QA TF요청 A — 재무 모델링',
        '재무',
        8,
        2000000,
        12000000,
        '[SEED-EMANITRI] 8주 내 분기별 CF 모델 갱신 및 투자자 설명 자료 초안.',
        '서울',
        'matching'::public.request_status
      )
    returning id into v_req1;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] QA TF요청 B — DX 로드맵',
        'IT',
        12,
        3000000,
        15000000,
        '[SEED-EMANITRI] 레거시 ERP 정리와 마이그레이션 PoC 범위·일정 합의.',
        '경기',
        'open'::public.request_status
      )
    returning id into v_req2;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] QA TF요청 C — HR 조직개편',
        'HR',
        6,
        1500000,
        8000000,
        '[SEED-EMANITRI] 핵심 인재 유지·GR 평가 체계 정비 컨설팅.',
        '서울',
        'in_progress'::public.request_status
      )
    returning id into v_req3;

    insert into public.request_matches (request_id, senior_id, fit_score, match_reasons)
      values
        (v_req1, v_sp_id, 0.8721, array['재무', '시장성']::text[]),
        (v_req2, v_sp_id, 0.8155, array['DX', '경력일치']::text[]),
        (v_req3, v_sp_id, 0.7988, array['HR', '조직']::text[]);

    insert into public.proposals (request_id, senior_id, fit_score, match_reasons, message, status)
      values
        (v_req1, v_sp_id, 0.8721, array['재무', '시장성']::text[], '[SEED-EMANITRI] 제안: 재무 모델링 TF 참여 의향 있습니다. 일정 협의 부탁드립니다.', 'pending'::public.proposal_status),
        (v_req2, v_sp_id, 0.8155, array['DX', '경력일치']::text[], '[SEED-EMANITRI] 제안: DX 로드맵 단계별 제안 드립니다.', 'pending'::public.proposal_status);

    insert into public.proposals (request_id, senior_id, fit_score, match_reasons, message, status)
      values (
        v_req3,
        v_sp_id,
        0.7988,
        array['HR', '조직']::text[],
        '[SEED-EMANITRI] 제안: HR 조직개편 TF 수락 가능합니다.',
        'accepted'::public.proposal_status
      )
    returning id into v_prop_acc;

    insert into public.contracts (proposal_id, start_date, end_date, role_scope, compensation, status, progress)
      values (
        v_prop_acc,
        date '2026-06-01',
        date '2026-08-31',
        '[SEED-EMANITRI] HR 조직개편 자문·워크숍 6회',
        12000000,
        'active'::public.contract_status,
        35
      )
    returning id into v_contract_id;

    insert into public.settlements (contract_id, amount, status) values (v_contract_id, 12000000, 'pending'::public.settlement_status);

    raise notice 'seed_emanitri: senior branch applied for user % (3 requests, 2 pending + 1 accepted + contract).', v_uid;

  elsif v_role = 'company' then
    select c.id into v_cid from public.companies c where c.owner_id = v_uid limit 1;

    if v_cid is null then
      raise notice 'seed_emanitri: company branch skip — no companies row for owner_id = user.';
      return;
    end if;

    select s.id into pool1 from public.senior_profiles s where s.profile_id is null order by s.created_at asc, s.id limit 1 offset 0;
    select s.id into pool2 from public.senior_profiles s where s.profile_id is null order by s.created_at asc, s.id limit 1 offset 1;
    select s.id into pool3 from public.senior_profiles s where s.profile_id is null order by s.created_at asc, s.id limit 1 offset 2;

    if pool1 is null then
      raise notice 'seed_emanitri: company branch skip — no pool senior_profiles (apply MVP migration seed first).';
      return;
    end if;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] 기업 QA 요청 1 — 전략 점검',
        '전략',
        10,
        2500000,
        14000000,
        '[SEED-EMANITRI] 사업 포트폴리오 우선순위 재정렬 및 보드용 자료.',
        '서울',
        'open'::public.request_status
      )
    returning id into v_req1;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] 기업 QA 요청 2 — 보안 감사',
        'IT',
        6,
        4000000,
        9000000,
        '[SEED-EMANITRI] ISMS 준비 범위 내 갭 분석.',
        '경기',
        'matching'::public.request_status
      )
    returning id into v_req2;

    insert into public.tf_requests (company_id, title, field, duration_weeks, budget_min, budget_max, goals, region, status)
      values (
        v_cid,
        '[SEED-EMANITRI] 기업 QA 요청 3 — 영업 채널',
        '영업',
        8,
        1800000,
        7000000,
        '[SEED-EMANITRI] B2B 파이프라인 KPI 정비.',
        '부산',
        'in_progress'::public.request_status
      )
    returning id into v_req3;

    if pool2 is null then pool2 := pool1; end if;
    if pool3 is null then pool3 := pool1; end if;

    insert into public.request_matches (request_id, senior_id, fit_score, match_reasons)
      values
        (v_req1, pool1, 0.81, array['전략', '경험']::text[]),
        (v_req2, pool2, 0.76, array['보안', 'IT']::text[]),
        (v_req3, pool3, 0.74, array['영업', '채널']::text[]);

    insert into public.proposals (request_id, senior_id, fit_score, match_reasons, message, status)
      values
        (v_req1, pool1, 0.81, array['전략', '경험']::text[], '[SEED-EMANITRI] 기업 발송 제안 1 — 전략 TF 참여 제안.', 'pending'::public.proposal_status),
        (v_req2, pool2, 0.76, array['보안', 'IT']::text[], '[SEED-EMANITRI] 기업 발송 제안 2 — 보안 감사 지원.', 'pending'::public.proposal_status),
        (v_req3, pool3, 0.74, array['영업', '채널']::text[], '[SEED-EMANITRI] 기업 발송 제안 3 — 영업 채널 컨설팅.', 'pending'::public.proposal_status);

    raise notice 'seed_emanitri: company branch applied for user % (3 TF requests + matches + proposals).', v_uid;

  else
    raise notice 'seed_emanitri: skip — profiles.role is % (expected company or senior).', v_role;
  end if;
end
$seed$;
