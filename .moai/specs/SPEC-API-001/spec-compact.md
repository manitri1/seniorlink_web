# SPEC-API-001 (Compact)

## Requirements

- REQ-MATCH-001: `/requests/[requestId]/matches`에 request_matches fit_score + match_reasons[] 표시 (24px row, divider).
- REQ-MATCH-002: If 매칭 알고리즘 populate 필요, then RPC/외부 트리거로 채우고 UI는 읽기 전용. populate_request_matches SQL RPC + runMatching Server Action + RunMatchingForm UI 구현 완료.
- REQ-PROPOSAL-001: While `/requests/[requestId]/proposals`, 본인 TF proposals insert/select.
- REQ-PROPOSAL-002: When 제안 생성, 중복 방지(status='pending' partial unique) + 토스트 + revalidatePath.
- REQ-PROPOSAL-003: When 제안 철회, Server Action/RPC로 status='withdrawn'. proposal-actions.ts의 withdrawProposal 함수로 구현 완료.
- REQ-PROPOSAL-004: While pending 제안 존재, when 동일 대상 추가 제안, partial unique로 거부 + 실패 토스트.
- REQ-SENIOR-001: `/senior/proposals` 목록 + `/senior/proposals/[proposalId]` 상세 + accept/reject Server Action.
- REQ-SENIOR-002: When 시니어 수락, contract 생성 + RLS로 본인 제안만.
- REQ-SENIOR-003: If 타인 제안 수정, then RLS 차단.

## Acceptance Criteria

- Given request_matches 채워진 TF, When matches 접근, Then fit_score/match_reasons 표시 (알고리즘 미실행).
- Given pending 제안 존재, When 동일 대상 재제안, Then partial unique 거부 + 실패 토스트; 신규는 insert + 성공 토스트.
- Given pending 제안 시니어 상세, When 수락, Then status 갱신 + contract 원자적 생성 (RLS).
- Given 본인 pending 제안, When 철회 클릭, Then status='withdrawn'. ✅
- Given 매칭 RPC 구성, When 매칭 실행, Then request_matches 실제 값 채워짐. ✅
