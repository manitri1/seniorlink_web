---
id: SPEC-API-002
version: "1.1.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-API-002: 계약·정산·리뷰

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 6 진행 중. 계약 목록/상세, PDF 생성, 정산 CRUD/스테퍼, Toss 결제 웹훅, 리뷰, 시니어 계약 조회를 EARS 형식으로 정리. UI 완료, PDF 생성과 웹훅 서명 검증 미구현.

## Overview

계약 체결 이후의 정산과 리뷰 라이프사이클을 정의한다. `/contracts` 목록과 `/contracts/[contractId]` 상세는 status, progress%, 시니어 이름, TF 요청 제목을 nested select로 조회한다. 계약 PDF는 Supabase Storage 업로드 또는 Edge Function 생성으로 pdf_url을 contracts에 저장한다. `/contracts/[contractId]/settlement`는 settlements CRUD를 Server Action(RLS)으로 처리하고, status 스테퍼 UI(pending → held → released/failed)를 제공한다. `/api/webhooks/payment` Route Handler는 Toss 서명을 검증한 뒤 service role로 정산 상태를 갱신한다. 리뷰는 contract.status='completed'이고 reviewer=auth.uid()일 때만 contract_reviews에 insert된다. 시니어는 `/senior/contracts`에서 RLS 읽기 전용으로 계약을 조회한다. 현재 UI는 완료 상태이나 PDF 생성과 Toss 웹훅 서명 검증은 미구현이다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-CONTRACT-001: The system **shall** `/contracts` 목록과 `/contracts/[contractId]` 상세에서 contracts를 status, progress%, 시니어 이름, TF 요청 제목과 함께 nested select로 조회한다.
- REQ-SENIOR-CONTRACT-001: The system **shall** `/senior/contracts`에서 RLS 읽기 전용(view-only)으로 시니어 본인 계약 목록을 제공한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-CONTRACT-002: **When** 계약 PDF가 요청되면, the system **shall** Supabase Storage 업로드 또는 Edge Function 생성으로 PDF를 만들고 pdf_url을 contracts 테이블에 저장한다. (미구현)
- REQ-WEBHOOK-001: **When** Toss 결제 웹훅이 `/api/webhooks/payment`로 전달되면, the system **shall** 서명(signature)을 검증한 뒤 service role로 정산 status를 DB에 갱신한다. (서명 검증 미구현)
- REQ-REVIEW-001: **When** 리뷰가 생성되면, the system **shall** contract.status='completed'이고 reviewer=auth.uid()일 때만 `/reviews`에서 contract_reviews에 insert한다.

### State-Driven (상태 기반 요구사항)

- REQ-SETTLEMENT-001: **While** 기업 사용자가 `/contracts/[contractId]/settlement`를 보는 상태이면, the system **shall** settlements를 Server Action(RLS)으로 CRUD한다.
- REQ-SETTLEMENT-002: **While** 정산이 진행되는 상태이면, the system **shall** status 스테퍼 UI로 pending → held → released/failed 흐름을 표시한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-WEBHOOK-002: **If** Toss 웹훅 서명 검증에 실패하면, **then** the system **shall** 요청을 거부하고 DB를 갱신하지 않는다.
- REQ-REVIEW-002: **If** contract.status가 'completed'가 아니거나 reviewer가 auth.uid()와 다르면, **then** the system **shall** 리뷰 생성을 차단한다.

### Complex (복합 요구사항)

- REQ-CONTRACT-003: **While** 계약 상세를 보는 상태에서, **when** 정산과 리뷰 상태가 변경되면, the system **shall** progress%와 status 표시를 일관되게 갱신한다.

## What NOT to Build (Exclusions)

- 다중 결제 provider(multiple payment providers)는 포함하지 않는다 (Toss 단일).
- Toss 외 third-party escrow 연동은 다루지 않는다.
- 계약 수정 워크플로우(contract amendment workflow)는 본 SPEC 범위에서 제외한다.
- 분쟁 해결(dispute resolution) 기능은 다루지 않는다.

## Affected Files

- `src/app/(dashboard)/contracts/page.tsx` (목록)
- `src/app/(dashboard)/contracts/[contractId]/page.tsx` (상세)
- `src/app/(dashboard)/contracts/[contractId]/settlement/page.tsx`
- `src/app/(dashboard)/contracts/actions.ts`
- `src/app/(senior)/senior/contracts/page.tsx`
- `src/app/api/webhooks/payment/route.ts`
- `src/lib/contract.ts`
- `src/lib/contract-server.ts`

## Implementation Status (진행 중 항목)

- **REQ-CONTRACT-002 (미구현)**: PDF 생성 — 현재 stub/placeholder. Storage 업로드 또는 Edge Function 생성 후 pdf_url 저장 필요.
- **REQ-CONTRACT-002 ✅**: `generateContractPdf` Server Action + `buildContractPdfBytes` (의존성 없는 순수 PDF 생성기) 구현. `supabase/migrations/20260607000002_add_contracts_storage_bucket.sql`로 `contracts` 버킷 생성. 1년 유효 서명 URL을 `contracts.pdf_url`에 저장. `GeneratePdfForm.tsx` 버튼 컴포넌트 추가.
- **REQ-WEBHOOK-001 ✅**: `src/app/api/webhooks/payment/route.ts` 전체 구현. Toss Basic Auth(`Authorization: Basic base64(secretKey:)`) 검증 + `mapTossStatus` (DONE/CANCELED/IN_PROGRESS 매핑) + `createServiceClient()`로 settlements RLS 우회 갱신. `TOSS_SECRET_KEY` 환경 변수 필요.
