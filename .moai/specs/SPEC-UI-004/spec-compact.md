# SPEC-UI-004 (Compact)

## Requirements

- REQ-DASH-001: While `/dashboard`, 활성 TF 수/대기 제안 수/파이프라인 계약 수 통계 카드 + 최근 요청 목록.
- REQ-DASH-002: When 대시보드 로드, `getDashboardSnapshot()`으로 `createServerClient` DB 카운트 집계.
- REQ-DASH-003: If 데이터 없음, then 통계 카드 0 표시 + 빈 상태.
- REQ-SENIOR-DASH-001: While `/senior/dashboard`, 시니어용 제안/계약 수 요약.
- REQ-LANDING-001: 루트 `/`에 HomeLanding hero + `/login`·`/signup` CTA 공개 랜딩.
- REQ-SETTINGS-001: `/settings`에 이메일 표시 + 로그아웃(`auth.signOut` Server Action), 양 역할.
- REQ-NAV-001: While 인증, when 첫 로그인, company→`/dashboard`, senior→`/senior/dashboard` 진입.

## Acceptance Criteria

- Given 데이터 보유 기업, When `/dashboard` 접근, Then 통계 카드 + 최근 요청 목록 표시.
- Given 비로그인, When `/` 접근, Then HomeLanding hero + CTA (가드 미적용).
- Given `/settings` 접근, When 로그아웃 클릭, Then `auth.signOut`로 세션 정리.
- Given 인증 성공, When 첫 로그인, Then company→`/dashboard`, senior→`/senior/dashboard`.
