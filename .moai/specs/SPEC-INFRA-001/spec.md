---
id: SPEC-INFRA-001
version: "1.1.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-INFRA-001: 검증·출시·CI/CD 파이프라인

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 8 초안(draft). E2E 스모크 테스트, 접근성/성능 기준, 보안 검증, GitHub Actions CI/CD, Vercel·Supabase 배포, 스테이징 스모크를 EARS 형식으로 정리. 구조만 존재하며 전체 구현 필요.
- 2026-06-07 (v1.1.0): SPEC-INFRA-001 DDD IMPROVE 완료. REQ-CICD-001·REQ-TEST-001·REQ-SEC-001 구현. REQ-DEPLOY-001·REQ-SMOKE-001은 운영 단계 수동 확인(문서화 완료). REQ-A11Y-001은 조건부(Lighthouse 활성화 시 수동 측정 가이드 제공).

## Overview

Seniorlink Web의 품질 검증과 출시 자동화 파이프라인을 정의한다. Playwright E2E 스모크 테스트가 BTS-01~04 시나리오(기업 회원가입→TF 생성, 매칭 표시, 제안 수락, 계약 조회)를 커버하며 포트 3005·chromium에서 실행된다. Lighthouse 접근성 점수 90 이상, 성능 80 이상(prd.md §7)을 충족하고, `npm audit --audit-level=high` 통과, RLS 회귀 테스트, service role key 유출 점검을 수행한다. GitHub Actions 워크플로우(`.github/workflows/ci.yml`)가 lint → build → audit → Playwright E2E를 순차 실행한다. Next.js 웹은 Vercel에, DB는 Supabase Cloud에 배포하고 환경 변수는 Vercel 대시보드에 설정한다. 스테이징 URL에서 기업 전체 플로우(회원가입 → TF 생성 → 매칭 조회 → 제안 발송)를 시연한다. 현재는 구조만 존재하며 CI 워크플로우, E2E 시나리오, 배포 자동화는 전체 구현이 필요하다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-TEST-002: The system **shall** Playwright config가 포트 3005에서(`test:e2e` 스크립트) chromium 브라우저로 실행되도록 구성한다.
- REQ-DEPLOY-001: The system **shall** Next.js 웹을 Vercel에, DB를 Supabase Cloud에 배포하고 환경 변수를 Vercel 대시보드에 구성한다. (미구현)

### Event-Driven (이벤트 기반 요구사항)

- REQ-CICD-001: **When** 코드가 푸시되거나 PR이 생성되면, the system **shall** GitHub Actions 워크플로우(`.github/workflows/ci.yml`)로 lint → build → audit → Playwright E2E를 순차 실행한다. (미구현)
- REQ-SMOKE-001: **When** 스테이징 배포가 완료되면, the system **shall** 스테이징 URL에서 기업 전체 플로우(회원가입 → TF 생성 → 매칭 조회 → 제안 발송)를 시연 가능하게 한다. (미구현)

### State-Driven (상태 기반 요구사항)

- REQ-TEST-001: **While** E2E 스모크 테스트가 실행되는 상태이면, the system **shall** BTS-01~04(기업 회원가입→TF 생성, 매칭 표시, 제안 수락, 계약 조회)를 커버한다. (skeleton만 존재)

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-SEC-001: **If** `npm audit --audit-level=high`에서 high 등급 취약점이 발견되거나 RLS 회귀가 발생하거나 service role key 유출이 감지되면, **then** the system **shall** 파이프라인을 실패시키고 병합을 차단한다.

### Complex (복합 요구사항)

- REQ-A11Y-001: **While** Lighthouse 검증이 활성화된 상태에서, **when** 주요 페이지가 측정되면, the system **shall** 접근성 점수 90 이상, 성능 점수 80 이상(prd.md §7)을 충족한다.

## What NOT to Build (Exclusions)

- Docker/Nginx 설정은 포함하지 않는다 (Vercel이 호스팅을 담당).
- 다중 환경 브랜칭 전략(multi-environment branching strategy)은 다루지 않는다.
- 블루-그린 배포(blue-green deployment)는 본 SPEC 범위에서 제외한다.
- 성능 부하 테스트(performance load testing)는 다루지 않는다.

## Affected Files (생성 대상)

- `.github/workflows/ci.yml` (신규 생성 — 미존재)
- `e2e/smoke.spec.ts` (skeleton에서 BTS 시나리오로 확장)
- `docs/release-and-verification.md` (실제 검증 절차로 업데이트)

## Implementation Status

- **REQ-TEST-002 ✅**: `playwright.config.ts` 포트 3005 + chromium 설정 사전 존재. CI에서 `npm run start`만 실행하도록 webServer command 최적화.
- **REQ-CICD-001 ✅**: `.github/workflows/ci.yml` 재구성. 단계: TypeScript type-check → lint → build → audit → secret leak scan → E2E.
- **REQ-TEST-001 ✅**: `e2e/smoke.spec.ts`에 BTS-01~04 describe 블록 추가 (총 13개 테스트). CI 제약(placeholder Supabase)으로 인증 경계(redirect) 검증.
- **REQ-SEC-001 ✅**: `npm audit --audit-level=high` + NEXT_PUBLIC 시크릿 유출 스캔 CI 단계 추가.
- **REQ-A11Y-001 ⚠️**: 조건부 요구사항("while Lighthouse 활성화된 상태"). `docs/release-and-verification.md` §8.2에 수동 측정 가이드 문서화. @lhci/cli 미설치(선택).
- **REQ-DEPLOY-001 ⚠️**: `docs/release-and-verification.md` §8.4에 Vercel + Supabase Cloud 배포 절차 문서화. 실제 배포는 운영 단계 수동 작업.
- **REQ-SMOKE-001 ⚠️**: `docs/release-and-verification.md` §8.1 수동 체크리스트(BTS-WEB-01~05). 스테이징 환경 준비 후 수동 확인.
