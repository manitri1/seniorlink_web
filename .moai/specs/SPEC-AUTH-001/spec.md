---
id: SPEC-AUTH-001
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-AUTH-001: 인증·미들웨어·역할 가드

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 2 as-built 문서화. 로그인/회원가입, middleware 세션 갱신, 역할 기반 가드, OAuth 콜백을 EARS 형식으로 정리.

## Overview

Seniorlink Web의 인증과 접근 제어 체계를 정의한다. `/login`, `/signup` 경로를 제공하며 시니어는 `?role=senior` 쿼리로 역할을 선택한다. `auth.signUp`/`signInWithPassword`로 인증을 처리하고, `on_auth_user_created` 트리거가 profiles row에 role을 부여한다. `middleware.ts`는 `createServerClient`와 `updateSession()`으로 모든 요청에서 세션을 갱신한다. 보호된 layout은 세션이 없으면 `/login?returnUrl=...`로 리다이렉트하고, 역할에 따라 company는 `/dashboard`, senior는 `/senior/dashboard`로 분기한다. `/auth/callback` Route Handler는 OAuth/magic link 코드 교환을 처리한다. 서비스 롤 키는 서버 전용으로 유지하고 클라이언트 번들에는 anon key만 노출한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-AUTH-001: The system **shall** `/login`과 `/signup` 경로를 제공하고, 시니어 회원가입은 `?role=senior` 쿼리 파라미터로 역할을 선택하도록 한다.
- REQ-AUTH-003: The system **shall** `middleware.ts`에서 `createServerClient`와 `updateSession()`을 사용해 모든 요청마다 세션을 갱신한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-AUTH-002: **When** 사용자가 회원가입 또는 로그인을 요청하면, the system **shall** `auth.signUp` 또는 `signInWithPassword`를 호출하고 `on_auth_user_created` 트리거를 통해 profiles row에 role을 부여한다.
- REQ-AUTH-005: **When** OAuth 또는 magic link 인증 코드가 전달되면, the system **shall** `/auth/callback` Route Handler에서 code exchange를 수행해 세션을 수립한다.

### State-Driven (상태 기반 요구사항)

- REQ-AUTH-004: **While** 사용자가 인증된 상태이면, the system **shall** 역할에 따라 company는 `/dashboard`, senior는 `/senior/dashboard`로 리다이렉트한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-AUTH-006: **If** 세션이 없는 사용자가 보호된 layout에 접근하면, **then** the system **shall** `/login?returnUrl=...`로 리다이렉트한다.
- REQ-AUTH-007: **If** `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되려 하면, **then** the system **shall** 서버 전용으로 격리하여 클라이언트에는 anon key만 노출한다.

### Complex (복합 요구사항)

- REQ-AUTH-008: **While** 사용자가 미인증 상태에서, **when** 특정 보호 경로로 진입을 시도하면, the system **shall** returnUrl을 보존하여 로그인 후 원래 경로로 복귀시킨다.

## What NOT to Build (Exclusions)

- 소셜 OAuth provider 실제 설정(provider setup)은 구조만 제공하고 외부 콘솔 연동은 제외한다.
- 2단계 인증(2FA)은 포함하지 않는다.
- 이메일 인증(email verification flow)은 본 SPEC 범위에서 제외한다.
- 비밀번호 재설정(password reset) 플로우는 다루지 않는다.

## Affected Files

- `src/middleware.ts`
- `src/lib/supabase/middleware.ts` (`updateSession` helper)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/actions.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/(dashboard)/layout.tsx` (company 역할 가드)
- `src/app/(senior)/layout.tsx` (senior 역할 가드)
