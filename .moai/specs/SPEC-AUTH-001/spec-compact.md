# SPEC-AUTH-001 (Compact)

## Requirements

- REQ-AUTH-001: `/login`, `/signup` 경로 제공, senior는 `?role=senior` 쿼리로 역할 선택.
- REQ-AUTH-002: When 가입/로그인, `auth.signUp`/`signInWithPassword` + `on_auth_user_created` 트리거로 profiles role 부여.
- REQ-AUTH-003: `middleware.ts`에서 `createServerClient` + `updateSession()`으로 매 요청 세션 갱신.
- REQ-AUTH-004: While 인증 상태, company→`/dashboard`, senior→`/senior/dashboard` 리다이렉트.
- REQ-AUTH-005: When OAuth/magic link 코드 전달, `/auth/callback` Route Handler에서 code exchange.
- REQ-AUTH-006: If 세션 없이 보호 layout 접근, then `/login?returnUrl=...` 리다이렉트.
- REQ-AUTH-007: If service role key 클라이언트 포함 시도, then 서버 전용 격리, client는 anon key만.
- REQ-AUTH-008: While 미인증, when 보호 경로 진입, returnUrl 보존 후 로그인 후 원경로 복귀.

## Acceptance Criteria

- Given `/signup?role=senior`, When 가입 완료, Then role=senior + `/senior/dashboard`.
- Given 비로그인, When 보호 경로 접근, Then `/login?returnUrl=...` 후 복귀.
- Given 만료 임박 세션, When 페이지 요청, Then `updateSession()` 세션 갱신.
- Given 인증 코드 발급, When `/auth/callback?code=...`, Then 세션 수립 + 역할별 대시보드.
