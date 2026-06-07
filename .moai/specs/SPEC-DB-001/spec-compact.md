# SPEC-DB-001 (Compact)

## Requirements

- REQ-DB-001: Supabase project setup + CLI link 유지.
- REQ-DB-002: `.env.example`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 정의.
- REQ-DB-003: `@supabase/supabase-js` + `@supabase/ssr` 설치, `createServerClient`/`createBrowserClient` 분리.
- REQ-DB-004: When 마이그레이션 실행, 9개 도메인 테이블 + enum 생성.
- REQ-DB-005: While role 인증 상태, RLS로 company=own data / senior=involved data 접근 제한.
- REQ-DB-006: While CI 활성, when push, `npm run lint` + `npm run build` 순차 실행.
- REQ-DB-007: When 회원가입 완료, `on_auth_user_created` 트리거로 profiles + companies/senior_profiles 자동 생성.
- REQ-DB-008: If 미인증/무권한 접근, then RLS로 row 차단.
- REQ-DB-009: If RLS 재귀 발생, then `20260522100000` 마이그레이션으로 제거.

## Acceptance Criteria

- Given link된 프로젝트, When 코어 마이그레이션 실행, Then 9개 테이블 + enum 생성.
- Given 트리거 활성, When company 회원가입, Then profiles + companies 자동 생성.
- Given 사용자 A/B 존재, When A가 B의 tf_requests 조회, Then RLS로 결과 미반환.
- Given companies/tf_requests RLS 적용, When 본인 tf_requests 조회, Then 재귀 오류 없이 반환.
