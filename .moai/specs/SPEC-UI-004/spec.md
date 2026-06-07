---
id: SPEC-UI-004
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: medium
issue_number: 0
---

# SPEC-UI-004: 대시보드·랜딩·설정

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 7 as-built 문서화. 기업/시니어 대시보드, 공개 랜딩, 설정, 역할별 진입 라우팅을 EARS 형식으로 정리.

## Overview

서비스의 진입·요약·설정 경험을 정의한다. `/dashboard`는 활성 TF 요청 수, 대기 제안 수, 파이프라인 계약 수의 통계 카드와 최근 요청 목록을 표시하며, `getDashboardSnapshot()`이 `createServerClient`로 DB 카운트를 집계한다. 시니어 측은 `/senior/dashboard`에서 제안·계약 수 등 동등한 요약을 제공한다. 루트 `/`는 HomeLanding 컴포넌트로 hero + `/login`·`/signup` CTA의 공개 랜딩 페이지를 보여준다. `/settings`는 이메일 표시와 로그아웃(`auth.signOut` Server Action)을 양 역할에 제공한다. 인증된 기업 사용자는 첫 로그인 시 `/dashboard`로, 시니어는 `/senior/dashboard`로 진입한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-LANDING-001: The system **shall** 루트 `/`에서 HomeLanding 컴포넌트로 hero와 `/login`·`/signup` CTA를 포함한 공개 랜딩 페이지를 제공한다.
- REQ-SETTINGS-001: The system **shall** `/settings`에서 이메일을 표시하고 로그아웃 버튼(`auth.signOut` Server Action)을 양 역할(company/senior)에 제공한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-DASH-002: **When** 대시보드가 로드되면, the system **shall** `getDashboardSnapshot()`으로 `createServerClient`를 통해 DB에서 카운트를 집계한다.

### State-Driven (상태 기반 요구사항)

- REQ-DASH-001: **While** 기업 사용자가 `/dashboard`를 보는 상태이면, the system **shall** 활성 TF 요청 수, 대기 제안 수, 파이프라인 계약 수 통계 카드와 최근 요청 목록을 표시한다.
- REQ-SENIOR-DASH-001: **While** 시니어 사용자가 `/senior/dashboard`를 보는 상태이면, the system **shall** 제안 수·계약 수 등 시니어용 요약을 표시한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-DASH-003: **If** 집계 대상 데이터가 없으면, **then** the system **shall** 통계 카드에 0을 표시하고 최근 요청 목록에 빈 상태를 표시한다.

### Complex (복합 요구사항)

- REQ-NAV-001: **While** 사용자가 인증된 상태에서, **when** 첫 로그인이 발생하면, the system **shall** 기업은 `/dashboard`로, 시니어는 `/senior/dashboard`로 진입시킨다.

## What NOT to Build (Exclusions)

- 활동 피드(activity feed)는 포함하지 않는다.
- 알림 센터(notification center)는 다루지 않는다.
- 계정 삭제(account deletion)는 본 SPEC 범위에서 제외한다.
- 프로필 사진(profile photo)은 다루지 않는다.
- 실시간 대시보드 업데이트(real-time dashboard updates)는 포함하지 않는다.

## Affected Files

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(senior)/senior/dashboard/page.tsx`
- `src/app/page.tsx` (랜딩)
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(senior)/senior/settings/page.tsx`
- `src/lib/dashboard-server.ts` (`getDashboardSnapshot`)
