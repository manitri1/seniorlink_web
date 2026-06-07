# SPEC-DB-001 구현 계획

## Implementation Approach

Phase 0는 프로젝트 전체의 데이터 기반이므로 마이그레이션 우선(migration-first) 접근을 채택한다. Supabase CLI로 프로젝트를 link한 뒤, 코어 스키마를 단일 마이그레이션 파일로 정의하고 RLS 정책을 동일 마이그레이션에 포함시킨다. RLS 재귀 문제는 별도 hotfix 마이그레이션으로 분리해 변경 이력을 추적 가능하게 유지한다. Supabase 접근은 `@supabase/ssr`의 `createServerClient`/`createBrowserClient`로 서버·클라이언트 컨텍스트를 명확히 분리한다.

본 SPEC은 이미 구현 완료(as-built)된 상태이며, 실제 구현은 아래 파일에 반영되어 있다.

- 코어 스키마: `supabase/migrations/20260521110000_core_schema.sql`
- RLS 재귀 수정: `supabase/migrations/20260522100000_fix_rls_recursion_companies_tf_requests.sql`
- 시드: `supabase/seeds/qa/emanitri.sql`, `supabase/seeds/loadtest/moderate.sql`

## Technical Constraints

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 번들에 노출되어서는 안 되며 서버 전용으로 관리한다.
- RLS 정책은 테이블 간 상호 참조 시 무한 재귀를 유발하지 않도록 설계해야 한다 (companies ↔ tf_requests).
- 모든 도메인 테이블은 RLS를 활성화한 상태(enable RLS)를 기본으로 한다.
- enum 타입은 마이그레이션 내에서 테이블 생성 이전에 선언한다.

## Task Decomposition

1. Supabase 프로젝트 생성 및 CLI link (REQ-DB-001) — 완료
2. `.env.example` 환경 변수 정의 (REQ-DB-002) — 완료
3. `@supabase/supabase-js` + `@supabase/ssr` 설치, 클라이언트 분리 (REQ-DB-003) — 완료
4. 코어 스키마 + enum 마이그레이션 작성 (REQ-DB-004) — 완료
5. `on_auth_user_created` 트리거 정의 (REQ-DB-007) — 완료
6. 역할별 RLS 정책 작성 (REQ-DB-005, REQ-DB-008) — 완료
7. RLS 재귀 수정 hotfix 마이그레이션 (REQ-DB-009) — 완료
8. CI(lint + build) 구성 (REQ-DB-006) — 완료

## Risk Analysis

- **RLS 재귀 위험 (High)**: companies와 tf_requests 정책이 서로를 참조하면 PostgREST 쿼리가 무한 재귀에 빠진다. → `20260522100000` 마이그레이션으로 완화 완료.
- **서비스 롤 키 유출 위험 (High)**: service role key가 클라이언트로 전달되면 RLS가 우회된다. → 서버 전용 클라이언트로 격리.
- **트리거 누락 위험 (Medium)**: 회원가입 트리거 실패 시 프로필 미생성으로 후속 플로우 전체 차단. → 트리거 트랜잭션 보장 필요.
- **마이그레이션 순서 위험 (Medium)**: enum 선언이 테이블보다 늦으면 마이그레이션 실패. → 선언 순서 고정.
