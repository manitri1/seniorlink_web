# SPEC-AUTH-001 인수 기준 (Acceptance Criteria)

## Scenario 1: 역할 기반 회원가입 및 분기

- **Given** 사용자가 `/signup?role=senior` 경로에 접근한 상태에서
- **When** 이메일/비밀번호로 회원가입을 완료하면
- **Then** profiles row에 role=senior가 부여되고 `/senior/dashboard`로 리다이렉트된다.

## Scenario 2: 미인증 보호 경로 접근

- **Given** 세션이 없는(비로그인) 사용자가
- **When** `/dashboard` 또는 `/requests` 등 보호된 경로에 접근하면
- **Then** `/login?returnUrl=...`로 리다이렉트되고, 로그인 성공 후 원래 경로로 복귀한다.

## Scenario 3: 세션 갱신

- **Given** 인증된 사용자가 만료 임박한 세션을 가진 상태에서
- **When** 임의의 페이지를 요청하면
- **Then** `middleware.ts`의 `updateSession()`이 세션 쿠키를 갱신한다.

## Scenario 4: OAuth/magic link 콜백

- **Given** OAuth 또는 magic link 인증 코드가 발급된 상태에서
- **When** `/auth/callback?code=...`로 리다이렉트되면
- **Then** code exchange로 세션이 수립되고 역할별 대시보드로 이동한다.

## Edge Cases

- 잘못된 비밀번호로 로그인 시 인증 실패 메시지가 표시되고 세션이 생성되지 않는다.
- returnUrl에 외부 URL이 들어오면 무시하고 기본 대시보드로 이동한다 (open redirect 방지).
- company 사용자가 `/senior/*` 경로에 접근하면 본인 역할 대시보드로 리다이렉트된다.
- service role key가 클라이언트 번들에 포함되지 않음을 빌드 산출물에서 확인할 수 있다.

## Performance Criteria

- middleware 세션 갱신이 요청당 과도한 지연 없이 동작한다.
- 정적 자산 요청은 세션 갱신 대상에서 제외되어 불필요한 처리를 피한다.
