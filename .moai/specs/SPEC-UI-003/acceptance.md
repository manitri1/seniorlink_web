# SPEC-UI-003 인수 기준 (Acceptance Criteria)

## Scenario 1: TF 요청 생성

- **Given** 인증된 기업 사용자가 `/requests/new`에 접근한 상태에서
- **When** title, field, region, duration_weeks, budget_min, budget_max, goals를 입력하고 생성하면
- **Then** Server Action이 tf_requests에 insert하고 status가 open으로 설정된 채 목록 또는 상세로 이동한다.

## Scenario 2: 목록 상태 필터

- **Given** 여러 status의 TF가 존재하는 기업 사용자가
- **When** `/requests`에서 status를 open으로 필터링하면
- **Then** open 상태 TF만 created_at 정렬로 표시된다.

## Scenario 3: 빈 상태 CTA

- **Given** TF가 하나도 없는 신규 기업 사용자가
- **When** `/requests`에 접근하면
- **Then** 빈 상태 메시지와 TF 생성 CTA가 표시된다.

## Scenario 4: 상세 서브내비

- **Given** TF가 존재하는 기업 사용자가
- **When** `/requests/[requestId]`에 접근하면
- **Then** Overview | Matching Results | Proposals 서브내비 탭이 표시되고 상태 배지가 의미 색상으로 표시된다.

## Edge Cases

- budget_min이 budget_max보다 크면 검증 오류로 저장이 차단된다.
- 필수 필드(title 등) 누락 시 저장이 차단된다.
- 타인 소유 TF의 [requestId]에 접근하면 RLS로 조회되지 않는다.
- 존재하지 않는 requestId 접근 시 not-found 처리된다.

## Performance Criteria

- 목록 조회는 status 필터와 created_at 정렬이 단일 쿼리로 수행된다.
- 상세 탭 전환 시 동일 컨텍스트를 재사용해 중복 조회를 최소화한다.
