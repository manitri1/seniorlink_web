# SPEC-UI-004 구현 계획

## Implementation Approach

진입 경험을 공개(랜딩)와 인증(대시보드/설정)으로 나눈다. 랜딩은 정적 HomeLanding 컴포넌트로 hero + CTA를 제공하고, 대시보드는 Server Component에서 `getDashboardSnapshot()`으로 카운트를 한 번에 집계한다. 역할별 대시보드/설정은 (dashboard)·(senior) 라우트 그룹으로 분리하고, 첫 로그인 진입 라우팅은 인증 가드(SPEC-AUTH-001)의 역할 분기를 재사용한다.

본 SPEC은 구현 완료(as-built) 상태이며 실제 구현은 아래 파일에 반영되어 있다.

- `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(senior)/senior/dashboard/page.tsx`
- `src/app/page.tsx` (랜딩)
- `src/app/(dashboard)/settings/page.tsx`, `src/app/(senior)/senior/settings/page.tsx`
- `src/lib/dashboard-server.ts` (`getDashboardSnapshot`)

## Technical Constraints

- 대시보드 카운트 집계는 RLS 하에서 본인 데이터만 대상으로 한다.
- 랜딩 `/`는 공개 경로로 인증 가드를 적용하지 않는다.
- 로그아웃은 Server Action(`auth.signOut`)으로 처리하고 세션을 정리한다.
- 진입 라우팅은 SPEC-AUTH-001의 역할 분기와 일관성을 유지한다.

## Task Decomposition

1. `/dashboard` 통계 카드 + 최근 요청 목록 (REQ-DASH-001, REQ-DASH-003) — 완료
2. `getDashboardSnapshot()` 집계 헬퍼 (REQ-DASH-002) — 완료
3. `/senior/dashboard` 시니어 요약 (REQ-SENIOR-DASH-001) — 완료
4. `/` HomeLanding 랜딩 + CTA (REQ-LANDING-001) — 완료
5. `/settings` 이메일 표시 + 로그아웃 (REQ-SETTINGS-001) — 완료
6. 첫 로그인 역할별 진입 라우팅 (REQ-NAV-001) — 완료

## Risk Analysis

- **집계 성능 위험 (Medium)**: 카운트 쿼리가 다수일 경우 대시보드 로드 지연. → 단일 스냅샷 집계로 완화.
- **빈 상태 누락 위험 (Low)**: 데이터 0건일 때 빈 화면 노출. → 0 표시 + 빈 상태 처리.
- **진입 라우팅 불일치 위험 (Low)**: 인증 가드와 대시보드 라우팅 규칙 불일치. → SPEC-AUTH-001 재사용으로 일관성 확보.
