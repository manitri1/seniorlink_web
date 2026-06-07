# SPEC-API-002 구현 계획

## Implementation Approach

계약 라이프사이클을 조회·정산·리뷰 세 축으로 구성한다. 계약 조회는 nested select로 시니어/TF 정보를 한 번에 가져오고, 정산은 Server Action(RLS) CRUD와 스테퍼 UI로 진행 상태를 시각화한다. 결제 상태 동기화는 외부 Toss 웹훅이 트리거하며, 서명 검증 후 service role로 RLS를 우회해 DB를 갱신한다. PDF는 Storage 업로드 또는 Edge Function으로 생성해 pdf_url을 contracts에 저장한다. 리뷰는 완료된 계약에 대해 reviewer 본인만 작성 가능하도록 제약한다.

UI는 구현 완료 상태이며, 백엔드 로직 2건이 미완성이다. 아래 우선순위로 잔여 작업을 진행한다.

기존 구현 파일:

- `src/app/(dashboard)/contracts/` (page.tsx, [contractId]/page.tsx, settlement/page.tsx, actions.ts)
- `src/app/(senior)/senior/contracts/page.tsx`
- `src/app/api/webhooks/payment/route.ts` (골격)
- `src/lib/contract.ts`, `src/lib/contract-server.ts`

## Technical Constraints

- 웹훅 핸들러는 반드시 서명 검증을 통과한 요청만 처리하며, 검증 실패 시 DB 갱신을 하지 않는다.
- 웹훅의 DB 갱신은 service role을 사용하되 정산 status 갱신으로만 한정한다 (최소 권한).
- 리뷰 insert는 contract.status='completed' AND reviewer=auth.uid() 조건을 DB/Server Action 양쪽에서 보장한다.
- 시니어 계약 접근은 읽기 전용(RLS select만)이다.
- nested select는 contracts ↔ senior_profiles ↔ tf_requests 관계를 통해 수행한다.

## Task Decomposition

### 완료 항목

1. `/contracts` 목록 + `/contracts/[contractId]` 상세 nested select (REQ-CONTRACT-001) — 완료
2. `/contracts/[contractId]/settlement` CRUD Server Action (REQ-SETTLEMENT-001) — 완료
3. 정산 status 스테퍼 UI pending→held→released/failed (REQ-SETTLEMENT-002) — 완료
4. `/reviews` 리뷰 생성 + 조건 검증 (REQ-REVIEW-001, REQ-REVIEW-002) — 완료
5. `/senior/contracts` 읽기 전용 목록 (REQ-SENIOR-CONTRACT-001) — 완료

### 잔여 항목 (우선순위)

- **Priority High — REQ-WEBHOOK-001 / REQ-WEBHOOK-002**: Toss 웹훅 서명 검증 구현. Route Handler 골격에 서명 검증 로직을 추가하고 검증 통과 시에만 service role로 정산 status 갱신.
- **Priority High — REQ-CONTRACT-002**: PDF 생성 구현. Storage 업로드 또는 Edge Function 경로 중 선택해 pdf_url 저장 완성. (현재 stub)

## Risk Analysis

- **웹훅 위변조 위험 (High)**: 서명 검증 미구현 상태에서 웹훅 노출 시 임의 정산 상태 조작 가능. → 서명 검증 최우선 구현.
- **service role 남용 위험 (High)**: 웹훅 핸들러의 service role 권한이 정산 외 영역으로 확대되면 위험. → 갱신 범위 한정.
- **PDF 미생성 위험 (Medium)**: pdf_url이 빈 상태로 계약 신뢰성 저하. → PDF 생성 구현 필요.
- **리뷰 조건 우회 위험 (Medium)**: Server Action만 검증하고 DB 미검증 시 우회 가능. → 양쪽 검증 강제.
- **정산 상태 불일치 위험 (Medium)**: 웹훅과 UI 상태 동기화 지연. → revalidate 또는 폴링 고려.
