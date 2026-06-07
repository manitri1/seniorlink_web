# SPEC-AUTH-001 구현 계획

## Implementation Approach

`@supabase/ssr` 기반 세션 관리를 중심에 둔다. `middleware.ts`가 모든 요청에서 `updateSession()`을 호출해 쿠키 기반 세션을 갱신하고, 보호된 라우트 그룹의 layout이 서버 컴포넌트에서 세션과 role을 검사해 가드를 수행한다. 인증 로직은 Server Action(`actions.ts`)으로 캡슐화하고, OAuth/magic link 흐름은 `/auth/callback` Route Handler에서 code exchange로 마무리한다. 역할 분기는 profiles.role 값을 기준으로 한다.

본 SPEC은 구현 완료(as-built) 상태이며 실제 구현은 아래 파일에 반영되어 있다.

- `src/middleware.ts`, `src/lib/supabase/middleware.ts`
- `src/app/(auth)/login/page.tsx`, `signup/page.tsx`, `actions.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/(dashboard)/layout.tsx`, `src/app/(senior)/layout.tsx`

## Technical Constraints

- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트 번들 접근 불가 (서버 전용). 클라이언트는 anon key만 사용.
- middleware는 정적 자산 및 callback 경로를 제외한 모든 요청에서 세션을 갱신해야 한다.
- 역할 가드는 서버 컴포넌트 layout에서 수행해 클라이언트 우회를 방지한다.
- returnUrl은 open redirect 방지를 위해 내부 경로만 허용한다.

## Task Decomposition

1. `/login`, `/signup` 페이지 + role 쿼리 처리 (REQ-AUTH-001) — 완료
2. signUp / signInWithPassword Server Action (REQ-AUTH-002) — 완료
3. `middleware.ts` + `updateSession()` 세션 갱신 (REQ-AUTH-003) — 완료
4. 역할 기반 리다이렉트 + 보호 layout 가드 (REQ-AUTH-004, REQ-AUTH-006, REQ-AUTH-008) — 완료
5. `/auth/callback` code exchange Route Handler (REQ-AUTH-005) — 완료
6. 서비스 롤 키 서버 격리 검증 (REQ-AUTH-007) — 완료

## Risk Analysis

- **세션 갱신 누락 위험 (High)**: middleware matcher 설정 오류로 일부 경로에서 세션이 갱신되지 않으면 인증 상태가 만료된다. → matcher 범위 검증.
- **서비스 롤 키 유출 위험 (High)**: client component에서 service role import 시 RLS 우회. → 서버 전용 격리.
- **open redirect 위험 (Medium)**: returnUrl에 외부 URL 허용 시 피싱 위험. → 내부 경로 화이트리스트.
- **역할 가드 우회 위험 (Medium)**: 클라이언트 측 가드만 있을 경우 우회 가능. → 서버 layout 가드 강제.
