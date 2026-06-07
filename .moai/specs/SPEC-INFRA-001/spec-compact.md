# SPEC-INFRA-001 (Compact)

## Requirements

- REQ-TEST-001: While E2E 스모크 실행, BTS-01~04(기업 회원가입→TF 생성, 매칭 표시, 제안 수락, 계약 조회) 커버. (skeleton만 존재)
- REQ-TEST-002: Playwright config 포트 3005(`test:e2e`) + chromium 실행.
- REQ-A11Y-001: While Lighthouse 활성, when 주요 페이지 측정, 접근성 ≥90 / 성능 ≥80 (prd.md §7).
- REQ-SEC-001: If high 취약점/RLS 회귀/service role key 유출, then 파이프라인 실패 + 병합 차단.
- REQ-CICD-001: When push/PR, `.github/workflows/ci.yml`로 lint → build → audit → Playwright E2E 순차 실행. (미구현)
- REQ-DEPLOY-001: Next.js → Vercel, DB → Supabase Cloud, 환경 변수 Vercel 대시보드 구성. (미구현)
- REQ-SMOKE-001: When 스테이징 배포 완료, 스테이징 URL에서 기업 전체 플로우(회원가입→TF 생성→매칭 조회→제안 발송) 시연. (미구현)

## Acceptance Criteria

- Given Playwright 3005/chromium, When `test:e2e`, Then BTS-01~04 통과. (skeleton 확장 후)
- Given `ci.yml` 구성, When push/PR, Then lint→build→audit→E2E 순차, 실패 시 병합 차단. (미존재)
- Given 보안 검증 포함, When high 취약점/RLS 회귀/key 유출, Then 파이프라인 실패.
- Given Vercel+Supabase 배포, When 스테이징 완료, Then 기업 전체 플로우 동작. (미구현)
- Given Lighthouse CI 포함, When 주요 페이지 측정, Then 접근성 ≥90 / 성능 ≥80.
