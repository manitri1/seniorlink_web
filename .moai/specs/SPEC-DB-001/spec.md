---
id: SPEC-DB-001
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-DB-001: Supabase 프로젝트·환경·스키마 초안

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 0 as-built 문서화. Supabase 프로젝트 셋업, 환경 변수, 코어 스키마 마이그레이션, RLS 정책, CI 파이프라인을 EARS 형식으로 정리.

## Overview

Seniorlink Web의 데이터 기반(foundation)을 정의한다. Supabase 프로젝트를 생성하고 CLI로 로컬 환경과 연결하며, 환경 변수 관리 체계를 수립한다. `@supabase/supabase-js`와 `@supabase/ssr`을 도입해 서버/클라이언트 클라이언트를 분리하고, 기업·시니어 양면(dual-role) 마켓플레이스의 핵심 도메인 테이블(profiles, companies, senior_profiles, tf_requests, request_matches, proposals, contracts, settlements, contract_reviews)과 enum, RLS 정책을 마이그레이션으로 정의한다. 회원가입 시 `on_auth_user_created` 트리거로 프로필과 역할별 레코드를 자동 생성하며, 최소 CI(lint + build)를 구성한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-DB-001: The system **shall** Supabase 프로젝트를 생성하고 Supabase CLI를 통해 로컬 개발 환경과 link 상태를 유지한다.
- REQ-DB-002: The system **shall** `.env.example`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 환경 변수를 정의하여 환경 구성의 단일 기준(single source)을 제공한다.
- REQ-DB-003: The system **shall** `@supabase/supabase-js`와 `@supabase/ssr`을 설치하고 `createServerClient`(서버)와 `createBrowserClient`(클라이언트)를 분리해 컨텍스트별 Supabase 접근을 제공한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-DB-004: **When** 데이터베이스 마이그레이션이 실행되면, the system **shall** profiles, companies, senior_profiles, tf_requests, request_matches, proposals, contracts, settlements, contract_reviews 테이블과 관련 enum 타입을 생성한다.
- REQ-DB-007: **When** 신규 사용자가 Supabase Auth로 회원가입을 완료하면, the system **shall** `on_auth_user_created` 트리거로 profiles 레코드와 역할에 따른 companies 또는 senior_profiles 레코드를 자동 생성한다.

### State-Driven (상태 기반 요구사항)

- REQ-DB-005: **While** 사용자가 company 역할로 인증된 상태이면, the system **shall** RLS 정책에 따라 본인 소유 데이터(own data)에만 접근을 허용하고, senior 역할인 경우 관련된(involved) 데이터에만 접근을 허용한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-DB-008: **If** 인증되지 않았거나 권한이 없는 사용자가 테이블에 접근을 시도하면, **then** the system **shall** RLS 정책에 의해 해당 row 접근을 차단한다.
- REQ-DB-009: **If** RLS 정책이 companies 및 tf_requests 간 상호 참조로 무한 재귀(recursion)를 유발하면, **then** the system **shall** `20260522100000_fix_rls_recursion_companies_tf_requests.sql` 마이그레이션으로 재귀를 제거한다.

### Complex (복합 요구사항)

- REQ-DB-006: **While** CI 파이프라인이 활성화된 상태에서, **when** 코드가 푸시되면, the system **shall** `npm run lint`와 `npm run build`를 순차 실행해 정적 검증과 빌드 검증을 수행한다.

## What NOT to Build (Exclusions)

- 모바일 전용 스키마(mobile schema)는 구축하지 않는다. 웹 마켓플레이스 도메인에 집중한다.
- 푸시 알림(push notifications) 인프라는 포함하지 않는다.
- 실시간 구독(real-time subscriptions) 채널은 본 SPEC 범위에서 제외한다.
- 파일 스토리지(file storage) 버킷 구성은 후속 SPEC(SPEC-API-002 계약 PDF)에서 다룬다.

## Affected Files

- `supabase/migrations/20260521110000_core_schema.sql` (코어 스키마)
- `supabase/migrations/20260522100000_fix_rls_recursion_companies_tf_requests.sql` (RLS 재귀 수정)
- `supabase/seeds/qa/emanitri.sql` (QA 시드)
- `supabase/seeds/loadtest/moderate.sql` (부하 테스트 시드)
- `.env.example` (환경 변수 템플릿)
- `src/lib/supabase/` (createServerClient / createBrowserClient 분리)
