# SPEC-UI-004 인수 기준 (Acceptance Criteria)

## Scenario 1: 기업 대시보드 통계

- **Given** TF 요청, 제안, 계약 데이터가 있는 기업 사용자가
- **When** `/dashboard`에 접근하면
- **Then** 활성 TF 요청 수, 대기 제안 수, 파이프라인 계약 수 통계 카드와 최근 요청 목록이 `getDashboardSnapshot()` 집계 결과로 표시된다.

## Scenario 2: 공개 랜딩 페이지

- **Given** 비로그인 방문자가
- **When** 루트 `/`에 접근하면
- **Then** HomeLanding의 hero와 `/login`·`/signup` CTA가 표시되며 인증 가드가 적용되지 않는다.

## Scenario 3: 로그아웃

- **Given** 인증된 사용자가 `/settings`에 접근한 상태에서
- **When** 로그아웃 버튼을 클릭하면
- **Then** `auth.signOut` Server Action으로 세션이 정리되고 비로그인 상태가 된다.

## Scenario 4: 역할별 첫 진입 라우팅

- **Given** 인증에 성공한 사용자가
- **When** 첫 로그인이 완료되면
- **Then** 기업은 `/dashboard`, 시니어는 `/senior/dashboard`로 진입한다.

## Edge Cases

- 데이터가 0건인 신규 사용자의 대시보드는 통계 카드에 0을 표시하고 최근 요청에 빈 상태를 표시한다.
- 시니어 사용자가 `/dashboard`(기업용)에 접근하면 본인 역할 대시보드로 라우팅된다.
- 로그아웃 후 보호 경로 접근 시 로그인으로 리다이렉트된다 (SPEC-AUTH-001 연계).

## Performance Criteria

- 대시보드 카운트는 `getDashboardSnapshot()` 집계로 효율적으로 조회된다.
- 랜딩 페이지는 공개 정적 콘텐츠로 빠르게 로드된다.
