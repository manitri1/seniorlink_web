# SPEC-API-002 인수 기준 (Acceptance Criteria)

## Scenario 1: 계약 목록/상세 조회

- **Given** 계약이 체결된 기업 사용자가
- **When** `/contracts` 및 `/contracts/[contractId]`에 접근하면
- **Then** status, progress%, 시니어 이름, TF 요청 제목이 nested select로 함께 표시된다.

## Scenario 2: 정산 스테퍼

- **Given** 정산이 진행 중인 계약 상세에서
- **When** `/contracts/[contractId]/settlement`에 접근하면
- **Then** status 스테퍼가 pending → held → released/failed 흐름을 표시하고 Server Action으로 CRUD가 가능하다.

## Scenario 3: 리뷰 생성 조건

- **Given** contract.status='completed'인 계약의 당사자(reviewer=auth.uid())가
- **When** `/reviews`에서 리뷰를 작성하면
- **Then** contract_reviews에 insert된다. status가 completed가 아니거나 reviewer가 다르면 차단된다.

## Scenario 4: Toss 웹훅 서명 검증 (잔여 구현)

- **Given** Toss가 `/api/webhooks/payment`로 결제 이벤트를 전송한 상태에서
- **When** 서명 검증이 통과하면
- **Then** service role로 정산 status가 갱신된다. 서명 검증 실패 시 요청이 거부되고 DB가 갱신되지 않는다. (현재 미구현 — 구현 후 충족)

## Scenario 5: 계약 PDF 생성 (잔여 구현)

- **Given** 계약이 체결된 상태에서
- **When** PDF 생성이 요청되면
- **Then** Storage 업로드 또는 Edge Function으로 PDF가 생성되고 pdf_url이 contracts에 저장된다. (현재 stub — 구현 후 충족)

## Scenario 6: 시니어 읽기 전용 계약

- **Given** 계약 당사자인 시니어가
- **When** `/senior/contracts`에 접근하면
- **Then** 본인 계약 목록이 RLS 읽기 전용으로 표시되며 수정 액션은 노출되지 않는다.

## Edge Cases

- 위조된 서명의 웹훅 요청은 거부되며 정산 상태가 변경되지 않는다.
- status가 completed가 아닌 계약에 대한 리뷰 시도는 차단된다.
- 타인이 reviewer로 위장한 리뷰 insert는 RLS 및 조건 검증으로 차단된다.
- PDF 생성 실패 시 pdf_url은 갱신되지 않고 재시도가 가능하다.
- 시니어가 계약 수정 Server Action을 직접 호출해도 RLS로 차단된다.
- 동일 웹훅 이벤트가 중복 전달되면 멱등(idempotent)하게 처리되어야 한다.

## Performance Criteria

- 계약 상세는 nested select 단일 쿼리로 관련 정보를 조회한다.
- 웹훅 처리는 서명 검증 후 정산 status 갱신만 수행해 처리 비용을 최소화한다.
- 정산 상태 변경 후 관련 화면이 일관되게 갱신된다.
