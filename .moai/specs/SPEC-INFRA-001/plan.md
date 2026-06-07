# SPEC-INFRA-001 구현 계획

## Implementation Approach

검증·출시를 자동화 파이프라인으로 통합한다. 로컬/CI에서 동일하게 동작하는 Playwright E2E 스모크 테스트를 BTS 시나리오 기준으로 작성하고, GitHub Actions에서 lint → build → audit → E2E를 단계적 게이트로 구성한다. 보안 검증(npm audit, RLS 회귀, service role key 유출 점검)을 게이트에 포함해 취약점 발견 시 병합을 차단한다. 배포는 Vercel(웹) + Supabase Cloud(DB)로 분리하고, 스테이징에서 기업 전체 플로우를 스모크로 검증한다. Lighthouse 임계값(접근성 90, 성능 80)은 prd.md §7을 기준으로 한다.

본 SPEC은 초안(draft) 상태로 대부분 신규 구현이 필요하다.

## Technical Constraints

- Playwright는 포트 3005, chromium에서 실행한다 (`test:e2e` 스크립트).
- CI는 GitHub Actions를 사용하며 단계 실패 시 후속 단계를 중단한다.
- `npm audit --audit-level=high` 통과를 필수 게이트로 둔다.
- service role key는 CI 로그 및 산출물에 노출되어서는 안 된다.
- Vercel 환경 변수에 Supabase URL/anon key/service role key를 안전하게 구성한다.
- E2E 시나리오는 시드 데이터(`supabase/seeds/qa/emanitri.sql`)와 정합성을 유지한다.

## Task Decomposition

### Priority High — 잔여 핵심 구현

1. **REQ-TEST-001**: `e2e/smoke.spec.ts`를 skeleton에서 BTS-01~04 시나리오로 확장.
   - BTS-01: 기업 회원가입 → TF 요청 생성
   - BTS-02: 매칭 결과 표시 확인
   - BTS-03: 제안 수락 흐름
   - BTS-04: 계약 조회
2. **REQ-CICD-001**: `.github/workflows/ci.yml` 신규 작성 — lint → build → audit → Playwright E2E.
3. **REQ-DEPLOY-001**: Vercel(웹) + Supabase Cloud(DB) 배포 구성 및 환경 변수 설정.

### Priority Medium

4. **REQ-TEST-002**: Playwright config 포트 3005·chromium 확정.
5. **REQ-SEC-001**: npm audit + RLS 회귀 테스트 + service role key 유출 점검을 CI 게이트에 통합.
6. **REQ-A11Y-001**: Lighthouse 접근성 90 / 성능 80 검증 단계 추가.
7. **REQ-SMOKE-001**: 스테이징 URL 기업 전체 플로우 스모크 시연.

### Priority Low

8. `docs/release-and-verification.md`를 실제 검증 절차로 업데이트.

## Risk Analysis

- **E2E 불안정(flaky) 위험 (High)**: 비결정적 매칭/시드 의존으로 테스트 불안정. → 시드 정합성 확보 및 안정적 셀렉터 사용.
- **CI 미존재 위험 (High)**: `.github/workflows/ci.yml` 부재로 회귀가 자동 차단되지 않음. → 최우선 구현.
- **secret 유출 위험 (High)**: CI에서 service role key가 로그에 노출될 위험. → secret 마스킹 및 유출 점검 단계.
- **배포 자동화 미완성 위험 (Medium)**: 수동 배포로 인한 환경 불일치. → Vercel 자동 배포 연결.
- **Lighthouse 임계 미달 위험 (Medium)**: 접근성/성능 점수 미달로 게이트 실패. → 사전 측정 및 개선.
- **스테이징 데이터 위험 (Low)**: 스테이징 시드 부재로 스모크 실패. → QA 시드 적용.
