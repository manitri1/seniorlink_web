---
id: SPEC-UI-003
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-UI-003: TF 요청 CRUD

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 4 as-built 문서화. TF(Task Force) 요청의 목록/생성/상세 CRUD, 상태 필터, 상세 서브내비, 상태 배지를 EARS 형식으로 정리.

## Overview

기업이 TF(Task Force) 요청을 등록·관리하는 핵심 마켓플레이스 기능을 정의한다. `/requests`(목록), `/requests/new`(생성), `/requests/[requestId]`(상세) 경로를 제공한다. 목록은 tf_requests를 조회하고 상태 필터(open/matching/in_progress/completed/cancelled)와 created_at 정렬, 빈 상태 CTA를 제공한다. 생성/수정은 Server Action으로 title, field, region, duration_weeks, budget_min, budget_max, goals 필드를 insert/update하며 status 기본값은 open이다. 상세 페이지는 Overview | Matching Results | Proposals 서브내비 탭을 제공하고, 상태별 의미 색상의 배지를 표시한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-TF-001: The system **shall** `/requests`(목록), `/requests/new`(생성), `/requests/[requestId]`(상세) 경로를 제공한다.
- REQ-TF-005: The system **shall** 각 status enum 값(open/matching/in_progress/completed/cancelled)에 대해 의미 색상을 가진 상태 배지를 표시한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-TF-003: **When** 기업 사용자가 TF를 생성하거나 수정하면, the system **shall** Server Action으로 title, field, region, duration_weeks, budget_min, budget_max, goals를 insert/update하고 status 기본값을 open으로 설정한다.

### State-Driven (상태 기반 요구사항)

- REQ-TF-002: **While** 사용자가 목록 페이지를 보는 상태이면, the system **shall** tf_requests를 조회하고 status 필터와 created_at 정렬을 적용하며, 결과가 없으면 빈 상태 CTA를 표시한다.
- REQ-TF-004: **While** 사용자가 상세 페이지를 보는 상태이면, the system **shall** Overview | Matching Results | Proposals 서브내비 탭을 제공한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-TF-006: **If** budget_min이 budget_max보다 크거나 필수 필드가 누락되면, **then** the system **shall** 검증 오류를 표시하고 저장을 차단한다.

### Complex (복합 요구사항)

- REQ-TF-007: **While** 기업 사용자가 인증된 상태에서, **when** 본인 소유 TF만 RLS로 필터링되면, the system **shall** `src/lib/tf-request.ts`의 type guard와 status label, `src/lib/tf-request-server.ts`의 서버 조회 헬퍼를 사용해 일관된 데이터 접근을 제공한다.

## What NOT to Build (Exclusions)

- 고급 검색/필터(advanced search/filter)는 포함하지 않는다 (기본 status 필터만 제공).
- 일괄 작업(bulk operations)은 다루지 않는다.
- 요청 템플릿(request templates) 기능은 본 SPEC 범위에서 제외한다.
- 중복 탐지(duplicate detection)는 다루지 않는다.

## Affected Files

- `src/app/(dashboard)/requests/page.tsx` (목록)
- `src/app/(dashboard)/requests/new/page.tsx` (생성)
- `src/app/(dashboard)/requests/[requestId]/page.tsx` (상세)
- `src/app/(dashboard)/requests/layout.tsx`
- `src/app/(dashboard)/requests/actions.ts`
- `src/lib/tf-request.ts` (type guard, status label)
- `src/lib/tf-request-server.ts` (서버 조회 헬퍼)
