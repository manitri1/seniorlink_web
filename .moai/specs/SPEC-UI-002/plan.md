# SPEC-UI-002 구현 계획

## Implementation Approach

Server Component로 본인 companies row를 읽어 폼 초기값을 채우고, Server Action `saveCompanyProfile`로 upsert를 처리하는 read-then-write 패턴을 적용한다. RLS가 본인 데이터만 허용하므로 추가 권한 검사 없이 보안을 확보한다. description은 공유 Textarea 컴포넌트(SPEC-UI-001)를 재사용한다. PostgREST/RLS 오류는 도메인 메시지로 매핑해 사용자 경험을 개선한다.

본 SPEC은 구현 완료(as-built) 상태이며 실제 구현은 아래 파일에 반영되어 있다.

- `src/app/(dashboard)/company/profile/page.tsx`
- `src/app/(dashboard)/company/actions.ts` (`saveCompanyProfile`)

## Technical Constraints

- companies upsert는 RLS 정책 하에서만 동작하며 본인 row 외 접근 불가.
- 폼 접근성: 각 입력은 Label과 `aria-describedby` 오류 연결을 갖춰야 한다.
- website_url은 형식 검증(URL)을 거친다.
- Server Action은 mutation 후 적절히 캐시를 무효화한다.

## Task Decomposition

1. `/company/profile` 페이지 + 필드 구성 (REQ-PROFILE-001) — 완료
2. Server Component 초기값 조회 (REQ-PROFILE-005) — 완료
3. `saveCompanyProfile` Server Action upsert (REQ-PROFILE-002) — 완료
4. 폼 검증 + aria 오류 + 오류 매핑 (REQ-PROFILE-003) — 완료
5. 프로필 미완성 가드 모달 (REQ-PROFILE-004, optional) — 완료

## Risk Analysis

- **RLS 오류 노출 위험 (Medium)**: 원시 PostgREST 오류가 그대로 노출되면 UX 저하 및 정보 누출. → 도메인 메시지 매핑.
- **upsert 충돌 위험 (Low)**: 동시 저장 시 race. → 사용자당 단일 row로 영향 제한적.
- **접근성 누락 위험 (Low)**: aria 연결 누락 시 스크린리더 사용성 저하. → aria-describedby 강제.
