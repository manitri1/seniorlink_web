# SPEC-UI-002 (Compact)

## Requirements

- REQ-PROFILE-001: `/company/profile` 페이지에 name, industry, description, website_url 필드.
- REQ-PROFILE-002: When 저장, Server Action `saveCompanyProfile` + `createServerClient`로 companies upsert (RLS).
- REQ-PROFILE-003: If 입력 무효/RLS·PostgREST 오류, then aria-describedby 오류 메시지 + 사용자 친화 매핑.
- REQ-PROFILE-004: While 프로필 미완성, TF 생성 진입 시 모달로 작성 유도 (optional).
- REQ-PROFILE-005: While 인증, when 프로필 로드, Server Component로 본인 companies row RLS 조회 후 초기값 표시.

## Acceptance Criteria

- Given `/company/profile` 접근, When 필드 입력+저장, Then companies upsert + 성공 메시지.
- Given 저장 이력 있는 사용자, When 재로드, Then 기존 값 채워짐.
- Given 폼 작성 중, When 잘못된 website_url 저장 시도, Then aria 오류 메시지 + 저장 차단.
