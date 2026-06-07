---
id: SPEC-UI-002
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: medium
issue_number: 0
---

# SPEC-UI-002: 기업 프로필 관리

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 3 as-built 문서화. 기업 프로필 페이지, Server Action upsert, 폼 검증, 프로필 미완성 가드를 EARS 형식으로 정리.

## Overview

기업(company) 사용자가 자신의 회사 정보를 관리하는 기능을 정의한다. `/company/profile` 페이지에서 name, industry, description, website_url 필드를 입력하며, Server Component로 기존 값을 읽고 Server Action(`saveCompanyProfile`)으로 `createServerClient`를 통해 companies 테이블에 RLS 적용 하에 upsert한다. 폼은 검증과 `aria-describedby` 오류 메시지를 제공하고, RLS/PostgREST 오류를 사용자 친화적 메시지로 매핑한다. 선택적으로, 프로필이 미완성인 상태에서 TF 생성에 진입하면 모달로 프로필 작성을 유도한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-PROFILE-001: The system **shall** `/company/profile` 페이지에서 name, industry, description, website_url 필드를 제공한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-PROFILE-002: **When** 기업 사용자가 프로필을 저장하면, the system **shall** Server Action `saveCompanyProfile`을 통해 `createServerClient`로 companies 테이블에 RLS 적용 하에 upsert를 수행한다.

### State-Driven (상태 기반 요구사항)

- REQ-PROFILE-004: **While** 기업 프로필이 미완성인 상태이면, the system **shall** TF 생성 진입 시 모달로 프로필 작성을 유도한다. (optional)

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-PROFILE-003: **If** 폼 입력이 유효하지 않거나 RLS/PostgREST 오류가 발생하면, **then** the system **shall** `aria-describedby`로 연결된 오류 메시지를 표시하고 오류를 사용자 친화적 메시지로 매핑한다.

### Complex (복합 요구사항)

- REQ-PROFILE-005: **While** 기업 사용자가 인증된 상태에서, **when** 프로필 페이지를 로드하면, the system **shall** Server Component로 본인 companies row를 RLS 하에 조회하여 폼 초기값으로 표시한다.

## What NOT to Build (Exclusions)

- 회사 로고 파일 업로드(file upload for company logo)는 포함하지 않는다.
- 다중 회사 지원(multi-company support)은 다루지 않는다 (사용자당 단일 회사).
- 공개 회사 프로필 페이지(public company profile page)는 본 SPEC 범위에서 제외한다.

## Affected Files

- `src/app/(dashboard)/company/profile/page.tsx`
- `src/app/(dashboard)/company/actions.ts` (`saveCompanyProfile`)
- `src/components/Textarea.tsx` (description 필드에 사용)
