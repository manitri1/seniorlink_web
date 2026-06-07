# SPEC-UI-003 구현 계획

## Implementation Approach

표준 CRUD를 App Router의 라우트 세그먼트로 구성한다. 목록은 Server Component에서 RLS 조회 + status 필터 + created_at 정렬을, 생성/수정은 Server Action으로 처리한다. 도메인 로직(type guard, status label)은 `src/lib/tf-request.ts`에, 서버 조회 헬퍼는 `src/lib/tf-request-server.ts`에 분리해 재사용성과 일관성을 확보한다. 상세 페이지는 서브내비 탭(Overview/Matching/Proposals)으로 Phase 5 매칭·제안 기능의 진입점을 마련한다.

본 SPEC은 구현 완료(as-built) 상태이며 실제 구현은 아래 파일에 반영되어 있다.

- `src/app/(dashboard)/requests/` (page.tsx, new/page.tsx, [requestId]/page.tsx, layout.tsx, actions.ts)
- `src/lib/tf-request.ts`, `src/lib/tf-request-server.ts`

## Technical Constraints

- tf_requests 조회는 RLS로 본인 소유 row만 반환한다.
- status enum 값은 DB enum과 클라이언트 label이 일치해야 한다 (type guard로 보장).
- 신규 TF의 status 기본값은 open이다.
- 상세 서브내비는 동일 [requestId] 컨텍스트를 공유한다.

## Task Decomposition

1. `/requests` 목록 + status 필터 + 정렬 + 빈 상태 CTA (REQ-TF-002) — 완료
2. `/requests/new` 생성 폼 + Server Action insert (REQ-TF-003) — 완료
3. `/requests/[requestId]` 상세 + 서브내비 탭 (REQ-TF-001, REQ-TF-004) — 완료
4. 상태 배지 의미 색상 (REQ-TF-005) — 완료
5. budget 검증 + 필수 필드 검증 (REQ-TF-006) — 완료
6. `tf-request.ts` / `tf-request-server.ts` 헬퍼 (REQ-TF-007) — 완료

## Risk Analysis

- **status 불일치 위험 (Medium)**: DB enum과 UI label 불일치 시 렌더링 오류. → type guard로 보장.
- **budget 검증 누락 위험 (Medium)**: budget_min > budget_max 허용 시 비논리적 데이터. → 검증 강제.
- **상세 탭 권한 위험 (Low)**: 타인 TF 상세 접근 시도. → RLS로 차단.
- **정렬/필터 성능 위험 (Low)**: created_at 인덱스 부재 시 정렬 비용. → 인덱스 확인 권장.
