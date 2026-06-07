# SPEC-INFRA-001 인수 기준 (Acceptance Criteria)

## Scenario 1: E2E 스모크 — 기업 핵심 플로우 (BTS-01~04)

- **Given** Playwright가 포트 3005·chromium으로 구성된 상태에서
- **When** `test:e2e` 스크립트로 스모크 테스트가 실행되면
- **Then** BTS-01(회원가입→TF 생성), BTS-02(매칭 표시), BTS-03(제안 수락), BTS-04(계약 조회) 시나리오가 모두 통과한다. (현재 skeleton — 확장 후 충족)

## Scenario 2: CI 파이프라인 게이트

- **Given** `.github/workflows/ci.yml`이 구성된 상태에서
- **When** 코드 푸시 또는 PR이 생성되면
- **Then** lint → build → audit → Playwright E2E가 순차 실행되고, 한 단계라도 실패하면 후속 단계가 중단되며 병합이 차단된다. (현재 미존재 — 생성 후 충족)

## Scenario 3: 보안 게이트

- **Given** CI에 보안 검증이 포함된 상태에서
- **When** `npm audit --audit-level=high`에서 high 취약점이 발견되거나 RLS 회귀 또는 service role key 유출이 감지되면
- **Then** 파이프라인이 실패하고 병합이 차단된다.

## Scenario 4: 배포 및 스테이징 스모크

- **Given** Vercel(웹) + Supabase Cloud(DB) 배포가 구성된 상태에서
- **When** 스테이징 배포가 완료되면
- **Then** 스테이징 URL에서 기업 전체 플로우(회원가입 → TF 생성 → 매칭 조회 → 제안 발송)가 정상 동작한다. (현재 미구현 — 구성 후 충족)

## Scenario 5: 접근성·성능 임계값

- **Given** Lighthouse 검증이 CI에 포함된 상태에서
- **When** 주요 페이지가 측정되면
- **Then** 접근성 점수 90 이상, 성능 점수 80 이상(prd.md §7)을 충족한다.

## Edge Cases

- E2E 테스트가 시드 데이터 부재로 실패하면 QA 시드 적용 후 재실행해야 한다.
- audit에서 high 취약점이 패치 불가한 경우 명시적 예외 처리 및 추적이 필요하다.
- service role key가 CI 로그에 노출되면 즉시 secret 회전(rotation)이 필요하다.
- Lighthouse 점수가 측정 환경(네트워크/하드웨어)에 따라 변동될 수 있으므로 CI 환경 기준으로 평가한다.
- 스테이징 배포 실패 시 이전 정상 배포로의 롤백 경로가 보장되어야 한다.

## Performance Criteria

- 전체 CI 파이프라인이 합리적 시간 내에 완료된다 (lint/build/audit/E2E).
- E2E 스모크는 BTS 4개 시나리오를 안정적(non-flaky)으로 통과한다.
- Lighthouse 성능 점수 80 이상, 접근성 90 이상을 유지한다.
