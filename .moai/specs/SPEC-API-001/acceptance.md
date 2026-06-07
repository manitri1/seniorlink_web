# SPEC-API-001 인수 기준 (Acceptance Criteria)

## Scenario 1: 매칭 결과 표시 (읽기 전용)

- **Given** request_matches에 fit_score와 match_reasons[]가 채워진 TF가 존재하는 상태에서
- **When** 기업 사용자가 `/requests/[requestId]/matches`에 접근하면
- **Then** fit_score와 match_reasons[]가 24px row 간격·divider 라인 UI로 표시되며 UI는 알고리즘을 실행하지 않는다.

## Scenario 2: 제안 생성 및 중복 방지

- **Given** 기업 사용자가 `/requests/[requestId]/proposals`에서 제안을 작성하는 상태에서
- **When** 동일 대상에 대해 이미 pending 제안이 있는데 다시 제안을 시도하면
- **Then** partial unique 제약으로 거부되고 실패 토스트가 표시된다. 신규 제안인 경우 insert 성공 후 성공 토스트와 revalidatePath가 동작한다.

## Scenario 3: 시니어 제안 수락 → 계약 생성

- **Given** 시니어에게 전달된 pending 제안이 `/senior/proposals/[proposalId]`에 표시된 상태에서
- **When** 시니어가 수락(accept) Server Action을 실행하면
- **Then** 제안 status가 갱신되고 contract 레코드가 원자적으로 생성된다. (RLS로 본인 제안만 처리)

## Scenario 4: 제안 철회 (잔여 구현)

- **Given** 기업 사용자가 본인이 생성한 pending 제안을 보는 상태에서
- **When** 철회 버튼을 클릭하면
- **Then** Server Action으로 제안 status가 'withdrawn'으로 변경된다. (현재 미구현 — 구현 후 충족)

## Scenario 5: 매칭 RPC populate (잔여 구현)

- **Given** 매칭 알고리즘 RPC 또는 외부 트리거가 구성된 상태에서
- **When** TF에 대한 매칭이 실행되면
- **Then** request_matches가 실제 fit_score/match_reasons로 채워지고 UI가 이를 표시한다. (현재 demo/placeholder — RPC 구현 후 충족)

## Edge Cases

- 시니어가 타인의 제안을 수정 시도하면 RLS로 차단되어 변경이 반영되지 않는다.
- 매칭 결과가 없는 TF의 matches 페이지는 빈 상태를 표시한다.
- 이미 수락/거절된 제안에 대해 재차 상태 변경 시도 시 무효 처리된다.
- 수락 직후 contract 생성 실패 시 제안 상태 변경도 롤백된다 (원자성).
- withdrawn 상태의 제안은 다시 수락/거절 대상이 되지 않는다.

## Performance Criteria

- 매칭 목록은 request_matches 단일 조회로 표시된다.
- 제안 mutation 후 revalidatePath로 관련 화면만 무효화된다.
- 중복 제안 검사는 DB partial unique 제약으로 즉시 판정된다.
