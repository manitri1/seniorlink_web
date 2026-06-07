---
id: SPEC-API-001
version: "1.1.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-API-001: 매칭·제안 워크플로우

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 5 진행 중. 매칭 결과 표시, 제안 생성/철회, 시니어 제안 수락/거절 워크플로우를 EARS 형식으로 정리. UI 완료, 일부 백엔드 로직(매칭 RPC, 철회 Server Action) 미구현.

## Overview

기업과 시니어 전문가를 연결하는 매칭·제안 워크플로우를 정의한다. `/requests/[requestId]/matches`는 request_matches 테이블의 fit_score와 match_reasons[]를 표시하며(UI만 담당, 알고리즘 미실행), `/requests/[requestId]/proposals`는 기업이 제안을 생성/조회한다. 제안 생성은 중복 방지(status='pending' partial unique), 성공/실패 토스트, mutation 후 revalidatePath를 적용하고, 철회는 status를 'withdrawn'으로 변경한다. 시니어 측은 `/senior/proposals` 목록과 `/senior/proposals/[proposalId]` 상세에서 수락/거절 Server Action을 사용하며, 수락 시 contract 레코드를 생성한다. RLS로 시니어는 본인 제안만 수정할 수 있다. 현재 UI는 완료 상태이나 매칭 RPC와 철회 Server Action은 미구현이다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-MATCH-001: The system **shall** `/requests/[requestId]/matches`에서 request_matches 테이블의 fit_score와 match_reasons[]를 표시한다. 목록 UI는 24px row 간격과 divider 라인을 적용한다.
- REQ-SENIOR-001: The system **shall** `/senior/proposals` 목록과 `/senior/proposals/[proposalId]` 상세를 제공하고 accept/reject Server Action을 노출한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-PROPOSAL-002: **When** 기업 사용자가 제안을 생성하면, the system **shall** 중복 방지(status='pending' 조건의 partial unique)를 적용하고 성공/실패 토스트를 표시하며 mutation 후 revalidatePath를 호출한다.
- REQ-PROPOSAL-003: **When** 기업 사용자가 제안을 철회하면, the system **shall** Server Action 또는 RPC로 해당 제안의 status를 'withdrawn'으로 변경한다. (미구현)
- REQ-SENIOR-002: **When** 시니어가 제안을 수락하면, the system **shall** contract 레코드를 생성하고 RLS로 본인 제안만 업데이트되도록 검증한다.

### State-Driven (상태 기반 요구사항)

- REQ-PROPOSAL-001: **While** 기업 사용자가 `/requests/[requestId]/proposals`를 보는 상태이면, the system **shall** 본인 소유 TF의 proposals를 insert/select로 관리한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-MATCH-002: **If** 매칭 알고리즘이 request_matches를 채워야 하면, **then** the system **shall** RPC 또는 외부 트리거로 결과를 populate하고 UI는 결과를 읽기만 하며 알고리즘을 실행하지 않는다. (RPC 미구현, 현재 demo/placeholder)
- REQ-SENIOR-003: **If** 시니어가 타인의 제안을 수정하려 하면, **then** the system **shall** RLS로 차단한다.

### Complex (복합 요구사항)

- REQ-PROPOSAL-004: **While** 동일 TF에 대해 pending 제안이 이미 존재하는 상태에서, **when** 기업이 동일 대상에 추가 제안을 시도하면, the system **shall** partial unique 제약으로 중복을 거부하고 실패 토스트를 표시한다.

## What NOT to Build (Exclusions)

- 실시간 알림(real-time notifications)은 포함하지 않는다.
- AI 모델 학습(AI model training)은 다루지 않는다.
- 매칭 알고리즘 변경(matching algorithm changes)은 본 SPEC 범위에서 제외한다 (UI는 결과만 소비).
- 제안 메시징/채팅(proposal messaging/chat)은 다루지 않는다.

## Affected Files

- `src/app/(dashboard)/requests/[requestId]/matches/page.tsx`
- `src/app/(dashboard)/requests/[requestId]/proposals/page.tsx`
- `src/app/(dashboard)/requests/[requestId]/proposals/actions.ts`
- `src/app/(senior)/senior/proposals/page.tsx`
- `src/app/(senior)/senior/proposals/[proposalId]/page.tsx`
- `src/lib/proposal.ts`
- `src/lib/request-matches.ts`

## Implementation Status

- **REQ-MATCH-002 ✅**: `supabase/migrations/20260607000001_add_populate_request_matches_rpc.sql`에 `populate_request_matches(p_request_id uuid)` RPC 생성. `proposal-actions.ts`의 `runMatching` Server Action과 `matches/RunMatchingForm.tsx` UI 컴포넌트 구현 완료.
- **REQ-PROPOSAL-003 ✅**: DDD ANALYZE 과정에서 `proposal-actions.ts`의 `withdrawProposal` 함수가 이미 완전 구현된 것을 확인. SPEC 생성 시점과 현재 코드 간 차이.
