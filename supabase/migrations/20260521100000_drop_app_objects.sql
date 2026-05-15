-- Seniorlink: 앱 public 객체 제거 (스키마 squash 후 재적용용).
-- 다음 파일(20260521110000_core_schema.sql)이 전체 스키마를 다시 만듭니다.
-- 주의: public 안의 앱 테이블·enum·가입 트리거만 대상입니다. supabase_migrations 스키마는 건드리지 않습니다.

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user () cascade;

drop table if exists public.contract_reviews cascade;

drop table if exists public.settlements cascade;

drop table if exists public.contracts cascade;

drop table if exists public.proposals cascade;

drop table if exists public.request_matches cascade;

drop table if exists public.tf_requests cascade;

drop table if exists public.companies cascade;

drop table if exists public.senior_profiles cascade;

drop table if exists public.profiles cascade;

drop type if exists public.settlement_status cascade;

drop type if exists public.contract_status cascade;

drop type if exists public.proposal_status cascade;

drop type if exists public.request_status cascade;
