-- Seniorlink: profiles · TF · 매칭 · 계약 스택 단일 정의 (기존 8개 마이그레이션 통합).
-- 선행: 20260521100000_drop_app_objects.sql (또는 빈 DB).
-- QA 시드(emanitri): supabase/seeds/qa/emanitri.sql 수동 실행.

-- --- enums ---
do $$
begin
  create type public.request_status as enum ('open', 'matching', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.proposal_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.contract_status as enum ('draft', 'active', 'settlement_requested', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.settlement_status as enum ('pending', 'held', 'released', 'failed');
exception when duplicate_object then null;
end $$;

-- --- profiles ---
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('company', 'senior')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- --- companies (확장 컬럼 포함) ---
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid (),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  industry text,
  description text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.companies enable row level security;

drop policy if exists "companies_select_own" on public.companies;
drop policy if exists "companies_insert_own" on public.companies;
drop policy if exists "companies_update_own" on public.companies;
drop policy if exists "companies_select_senior_via_proposal" on public.companies;

create policy "companies_select_own" on public.companies for select using (owner_id = auth.uid());
create policy "companies_insert_own" on public.companies for insert with check (owner_id = auth.uid());
create policy "companies_update_own" on public.companies for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- --- tf_requests ---
create table if not exists public.tf_requests (
  id uuid primary key default gen_random_uuid (),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  field text not null,
  duration_weeks integer not null,
  budget_min integer,
  budget_max integer,
  goals text not null,
  region text not null,
  status public.request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tf_requests_duration_weeks_chk check (duration_weeks >= 1 and duration_weeks <= 104)
);

create index if not exists idx_tf_requests_company_id on public.tf_requests (company_id);
create index if not exists idx_tf_requests_status on public.tf_requests (status);
create index if not exists idx_tf_requests_created_at on public.tf_requests (created_at desc);

alter table public.tf_requests enable row level security;

drop policy if exists "tf_requests_select_own" on public.tf_requests;
drop policy if exists "tf_requests_insert_own" on public.tf_requests;
drop policy if exists "tf_requests_update_own" on public.tf_requests;
drop policy if exists "tf_requests_select_senior_invited" on public.tf_requests;

create policy "tf_requests_select_own" on public.tf_requests for select using (
  company_id in (select c.id from public.companies c where c.owner_id = auth.uid())
);
create policy "tf_requests_insert_own" on public.tf_requests for insert with check (
  company_id in (select c.id from public.companies c where c.owner_id = auth.uid())
);
create policy "tf_requests_update_own" on public.tf_requests for update using (
  company_id in (select c.id from public.companies c where c.owner_id = auth.uid())
)
with check (company_id in (select c.id from public.companies c where c.owner_id = auth.uid()));

-- --- senior_profiles (풀 + profile_id) ---
create table if not exists public.senior_profiles (
  id uuid primary key default gen_random_uuid (),
  display_name text not null,
  headline text,
  fields text[] not null default '{}',
  region text not null,
  years_experience integer not null default 0,
  profile_id uuid unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_senior_profiles_profile_id on public.senior_profiles (profile_id) where profile_id is not null;

comment on column public.senior_profiles.profile_id is
  '로그인 시니어(profiles.id = auth.users.id) 1:1. NULL이면 기업 매칭용 페르소나 풀.';

alter table public.senior_profiles enable row level security;

drop policy if exists "senior_profiles_select_authenticated" on public.senior_profiles;
drop policy if exists "senior_profiles_update_own" on public.senior_profiles;

create policy "senior_profiles_select_authenticated" on public.senior_profiles for select to authenticated using (true);
create policy "senior_profiles_update_own" on public.senior_profiles for update to authenticated using (profile_id = auth.uid())
with check (profile_id = auth.uid());

insert into public.senior_profiles (display_name, headline, fields, region, years_experience)
values
  ('김도현', '대기업 CFO 출신 · 상장 재무·자금 총괄', array['재무', 'M&A', 'IR'], '서울', 32),
  ('이전략', '글로벌 전략·PMO 리드 · 제조 DX', array['전략기획', 'PMO', 'DX'], '경기', 28),
  ('박인재', 'HRD·조직문화 · 코칭 500회+', array['HR', '조직문화', '리더십'], '서울', 24),
  ('최그로스', '해외영업·유통 · 동남아 거점', array['영업', '유통', '해외'], '부산', 30),
  ('정컴플', 'IT 아키텍처·보안 감사', array['IT', '보안', '아키텍처'], '대전', 26);

-- --- request_matches ---
create table if not exists public.request_matches (
  id uuid primary key default gen_random_uuid (),
  request_id uuid not null references public.tf_requests (id) on delete cascade,
  senior_id uuid not null references public.senior_profiles (id) on delete cascade,
  fit_score numeric(7, 4) not null,
  match_reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (request_id, senior_id),
  constraint request_matches_fit_chk check (fit_score >= 0 and fit_score <= 1)
);

create index if not exists idx_request_matches_request on public.request_matches (request_id);
create index if not exists idx_request_matches_score on public.request_matches (request_id, fit_score desc);

alter table public.request_matches enable row level security;

drop policy if exists "request_matches_select_own" on public.request_matches;
drop policy if exists "request_matches_insert_own" on public.request_matches;
drop policy if exists "request_matches_select_senior_own" on public.request_matches;

create policy "request_matches_select_own" on public.request_matches for select using (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
);
create policy "request_matches_insert_own" on public.request_matches for insert with check (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
);

create policy "request_matches_select_senior_own" on public.request_matches for select to authenticated using (
  exists (select 1 from public.senior_profiles sp where sp.id = request_matches.senior_id and sp.profile_id = auth.uid())
);

-- --- proposals ---
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid (),
  request_id uuid not null references public.tf_requests (id) on delete cascade,
  senior_id uuid not null references public.senior_profiles (id) on delete cascade,
  fit_score numeric(7, 4),
  match_reasons text[] not null default '{}',
  message text,
  status public.proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists proposals_request_senior_pending_unique on public.proposals (request_id, senior_id)
where status = 'pending';

create index if not exists idx_proposals_request on public.proposals (request_id);

alter table public.proposals enable row level security;

drop policy if exists "proposals_select_own" on public.proposals;
drop policy if exists "proposals_insert_own" on public.proposals;
drop policy if exists "proposals_update_own" on public.proposals;
drop policy if exists "proposals_select_senior_involved" on public.proposals;
drop policy if exists "proposals_update_senior_own" on public.proposals;

create policy "proposals_select_own" on public.proposals for select using (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
);
create policy "proposals_insert_own" on public.proposals for insert with check (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
);
create policy "proposals_update_own" on public.proposals for update using (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
)
with check (
  request_id in (
    select r.id from public.tf_requests r join public.companies c on r.company_id = c.id where c.owner_id = auth.uid()
  )
);

create policy "proposals_select_senior_involved" on public.proposals for select to authenticated using (
  exists (select 1 from public.senior_profiles sp where sp.id = proposals.senior_id and sp.profile_id = auth.uid())
);
create policy "proposals_update_senior_own" on public.proposals for update to authenticated using (
  exists (select 1 from public.senior_profiles sp where sp.id = proposals.senior_id and sp.profile_id = auth.uid())
)
with check (
  exists (select 1 from public.senior_profiles sp where sp.id = proposals.senior_id and sp.profile_id = auth.uid())
);

drop policy if exists "companies_select_senior_via_proposal" on public.companies;
create policy "companies_select_senior_via_proposal" on public.companies for select to authenticated using (
  exists (
    select 1
    from public.tf_requests tr
      join public.proposals p on p.request_id = tr.id
      join public.senior_profiles sp on sp.id = p.senior_id
    where tr.company_id = companies.id and sp.profile_id = auth.uid()
  )
);

drop policy if exists "tf_requests_select_senior_invited" on public.tf_requests;
create policy "tf_requests_select_senior_invited" on public.tf_requests for select to authenticated using (
  exists (
    select 1
    from public.proposals p
      join public.senior_profiles sp on sp.id = p.senior_id
    where p.request_id = tf_requests.id and sp.profile_id = auth.uid()
  )
);

-- --- contracts ---
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid (),
  proposal_id uuid not null unique references public.proposals (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  role_scope text not null,
  compensation integer not null,
  status public.contract_status not null default 'draft',
  pdf_url text,
  progress integer not null default 0,
  constraint contracts_progress_chk check (progress >= 0 and progress <= 100),
  constraint contracts_dates_chk check (end_date >= start_date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contracts_status on public.contracts (status);

alter table public.contracts enable row level security;

drop policy if exists "contracts_select_own" on public.contracts;
drop policy if exists "contracts_insert_own" on public.contracts;
drop policy if exists "contracts_update_own" on public.contracts;
drop policy if exists "contracts_select_senior_involved" on public.contracts;

create policy "contracts_select_own" on public.contracts for select using (
  proposal_id in (
    select p.id from public.proposals p
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);
create policy "contracts_insert_own" on public.contracts for insert with check (
  proposal_id in (
    select p.id from public.proposals p
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);
create policy "contracts_update_own" on public.contracts for update using (
  proposal_id in (
    select p.id from public.proposals p
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
)
with check (
  proposal_id in (
    select p.id from public.proposals p
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);

create policy "contracts_select_senior_involved" on public.contracts for select to authenticated using (
  exists (
    select 1 from public.proposals p
      join public.senior_profiles sp on sp.id = p.senior_id
    where p.id = contracts.proposal_id and sp.profile_id = auth.uid()
  )
);

-- --- settlements ---
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid (),
  contract_id uuid not null unique references public.contracts (id) on delete cascade,
  amount integer not null,
  status public.settlement_status not null default 'pending',
  toss_payment_key text,
  toss_order_id text,
  requested_at timestamptz,
  held_at timestamptz,
  released_at timestamptz,
  failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.settlements enable row level security;

drop policy if exists "settlements_select_own" on public.settlements;
drop policy if exists "settlements_insert_own" on public.settlements;
drop policy if exists "settlements_update_own" on public.settlements;
drop policy if exists "settlements_select_senior_involved" on public.settlements;

create policy "settlements_select_own" on public.settlements for select using (
  contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);
create policy "settlements_insert_own" on public.settlements for insert with check (
  contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);
create policy "settlements_update_own" on public.settlements for update using (
  contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
)
with check (
  contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);

create policy "settlements_select_senior_involved" on public.settlements for select to authenticated using (
  exists (
    select 1 from public.contracts ct
      join public.proposals p on p.id = ct.proposal_id
      join public.senior_profiles sp on sp.id = p.senior_id
    where ct.id = settlements.contract_id and sp.profile_id = auth.uid()
  )
);

-- --- contract_reviews ---
create table if not exists public.contract_reviews (
  id uuid primary key default gen_random_uuid (),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  reviewer_id uuid not null,
  senior_id uuid not null references public.senior_profiles (id) on delete restrict,
  rating smallint not null,
  comment text not null,
  created_at timestamptz not null default now(),
  unique (contract_id, reviewer_id),
  constraint contract_reviews_rating_chk check (rating >= 1 and rating <= 5),
  constraint contract_reviews_comment_len_chk check (char_length(comment) >= 10 and char_length(comment) <= 500)
);

create index if not exists idx_contract_reviews_contract on public.contract_reviews (contract_id);

alter table public.contract_reviews enable row level security;

drop policy if exists "contract_reviews_select_own" on public.contract_reviews;
drop policy if exists "contract_reviews_insert_own" on public.contract_reviews;
drop policy if exists "contract_reviews_select_senior_subject" on public.contract_reviews;

create policy "contract_reviews_select_own" on public.contract_reviews for select using (
  contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
);
create policy "contract_reviews_insert_own" on public.contract_reviews for insert with check (
  reviewer_id = auth.uid()
  and contract_id in (
    select ct.id from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
      join public.companies c on r.company_id = c.id
    where c.owner_id = auth.uid()
  )
  and exists (select 1 from public.contracts x where x.id = contract_id and x.status = 'completed')
);

create policy "contract_reviews_select_senior_subject" on public.contract_reviews for select to authenticated using (
  exists (select 1 from public.senior_profiles sp where sp.id = contract_reviews.senior_id and sp.profile_id = auth.uid())
);

-- --- auth: 가입 시 company → companies / senior → senior_profiles ---
create or replace function public.handle_new_user ()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
declare
  r text;
  display_name text;
begin
  r := coalesce(new.raw_user_meta_data ->> 'role', 'company');
  if r not in ('company', 'senior') then
    r := 'company';
  end if;
  display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');
  insert into public.profiles (id, role, full_name) values (new.id, r, display_name);
  if r = 'company' then
    insert into public.companies (owner_id, name)
      values (new.id, coalesce(display_name, split_part(new.email, '@', 1), '기업'));
  else
    insert into public.senior_profiles (display_name, headline, fields, region, years_experience, profile_id)
      values (
        coalesce(display_name, split_part(new.email, '@', 1), '시니어'),
        '',
        '{}'::text[],
        '서울',
        0,
        new.id
      );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute function public.handle_new_user ();

-- --- grants ---
grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.companies to authenticated;
grant select, insert, update on table public.tf_requests to authenticated;
grant select on table public.senior_profiles to authenticated;
grant update on table public.senior_profiles to authenticated;
grant select, insert on table public.request_matches to authenticated;
grant select, insert, update on table public.proposals to authenticated;
grant select, insert, update on table public.contracts to authenticated;
grant select, insert, update on table public.settlements to authenticated;
grant select, insert on table public.contract_reviews to authenticated;
