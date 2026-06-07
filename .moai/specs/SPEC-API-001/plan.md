# SPEC-API-001 구현 계획

## Implementation Approach

매칭과 제안을 분리된 책임으로 다룬다. 매칭(request_matches)은 백엔드 알고리즘(RPC/외부 트리거)이 채우고 UI는 fit_score·match_reasons[]를 읽기 전용으로 표시한다. 제안(proposals)은 Server Action으로 생성/철회/수락/거절을 처리하며 RLS와 partial unique 제약으로 무결성을 보장한다. 시니어 수락 시 contract 레코드를 트랜잭션으로 생성한다.

UI는 구현 완료 상태이며, 백엔드 로직 2건이 미완성이다. 아래 우선순위로 잔여 작업을 진행한다.

기존 구현 파일:

- `src/app/(dashboard)/requests/[requestId]/matches/page.tsx` (매칭 표시 UI)
- `src/app/(dashboard)/requests/[requestId]/proposals/page.tsx`, `actions.ts`
- `src/app/(senior)/senior/proposals/page.tsx`, `[proposalId]/page.tsx`
- `src/lib/proposal.ts`, `src/lib/request-matches.ts`

## Technical Constraints

- request_matches는 UI에서 절대 알고리즘을 실행하지 않는다 (읽기 전용 소비).
- proposals 중복 방지는 `status='pending'` 조건의 partial unique 제약으로 DB 레벨에서 강제한다.
- 시니어 제안 수정은 RLS로 본인 row만 허용한다.
- 수락 → contract 생성은 원자적으로 처리되어야 한다 (부분 성공 금지).
- mutation 후 `revalidatePath`로 캐시를 무효화한다.

## Task Decomposition

### 완료 항목

1. `/requests/[requestId]/matches` fit_score/match_reasons 표시 UI (REQ-MATCH-001) — 완료
2. `/requests/[requestId]/proposals` insert/select (REQ-PROPOSAL-001) — 완료
3. 제안 생성 + 중복 방지 + 토스트 + revalidatePath (REQ-PROPOSAL-002, REQ-PROPOSAL-004) — 완료
4. 시니어 제안 목록/상세 + accept/reject Server Action (REQ-SENIOR-001) — 완료
5. 시니어 수락 시 contract 생성 + RLS 검증 (REQ-SENIOR-002, REQ-SENIOR-003) — 완료

### 잔여 항목 (우선순위)

- **Priority High — REQ-MATCH-002**: 매칭 RPC 구현. request_matches를 실제로 populate하는 RPC 또는 외부 트리거 작성. 현재 demo/placeholder 대체.
- **Priority High — REQ-PROPOSAL-003**: 철회 Server Action 구현. 기존 UI 버튼과 연결해 status='withdrawn' 전이 로직 완성.

## Risk Analysis

- **매칭 데이터 신뢰성 위험 (High)**: placeholder 데이터가 운영에 노출되면 잘못된 매칭 표시. → RPC 구현 전까지 demo 표기 명확화.
- **철회 미구현 위험 (High)**: UI 버튼은 있으나 동작하지 않아 사용자 혼란. → Server Action 우선 구현.
- **중복 제안 race 위험 (Medium)**: 동시 제안 시 partial unique 위반. → DB 제약으로 안전 처리, 실패 토스트로 안내.
- **수락-계약 비원자성 위험 (Medium)**: 수락 성공 후 contract 생성 실패 시 불일치. → 트랜잭션/RPC로 원자성 보장.
- **RLS 우회 위험 (Medium)**: 시니어 타인 제안 수정 시도. → RLS 정책 회귀 테스트 필요.
