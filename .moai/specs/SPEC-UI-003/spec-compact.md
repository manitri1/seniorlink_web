# SPEC-UI-003 (Compact)

## Requirements

- REQ-TF-001: `/requests`(목록), `/requests/new`(생성), `/requests/[requestId]`(상세) 경로 제공.
- REQ-TF-002: While 목록, tf_requests 조회 + status 필터(open/matching/in_progress/completed/cancelled) + created_at 정렬 + 빈 상태 CTA.
- REQ-TF-003: When 생성/수정, Server Action insert/update (title, field, region, duration_weeks, budget_min, budget_max, goals), status 기본 open.
- REQ-TF-004: While 상세, Overview | Matching Results | Proposals 서브내비 탭.
- REQ-TF-005: status enum 값별 의미 색상 상태 배지.
- REQ-TF-006: If budget_min > budget_max 또는 필수 필드 누락, then 검증 오류 + 저장 차단.
- REQ-TF-007: While 인증, when 본인 TF RLS 필터, `tf-request.ts`(type guard/label) + `tf-request-server.ts`(서버 조회) 사용.

## Acceptance Criteria

- Given `/requests/new` 접근, When 필드 입력+생성, Then tf_requests insert + status open.
- Given 여러 status TF, When open 필터, Then open만 created_at 정렬 표시.
- Given TF 없는 사용자, When `/requests` 접근, Then 빈 상태 + 생성 CTA.
- Given TF 존재, When 상세 접근, Then Overview/Matching/Proposals 탭 + 상태 배지.
