# SPEC-UI-002 인수 기준 (Acceptance Criteria)

## Scenario 1: 기업 프로필 저장

- **Given** 인증된 기업 사용자가 `/company/profile`에 접근한 상태에서
- **When** name, industry, description, website_url을 입력하고 저장하면
- **Then** `saveCompanyProfile` Server Action이 companies 테이블에 upsert하고 성공 메시지가 표시된다.

## Scenario 2: 프로필 초기값 표시

- **Given** 이미 프로필을 저장한 기업 사용자가
- **When** `/company/profile`을 다시 로드하면
- **Then** Server Component가 본인 companies row를 조회해 폼에 기존 값이 채워진다.

## Scenario 3: 폼 검증 오류

- **Given** 기업 사용자가 프로필 폼을 작성 중인 상태에서
- **When** website_url에 잘못된 형식을 입력하고 저장을 시도하면
- **Then** `aria-describedby`로 연결된 오류 메시지가 표시되고 저장이 차단된다.

## Edge Cases

- 프로필이 한 번도 저장되지 않은 사용자는 빈 폼이 표시된다 (초기값 없음).
- RLS 거부 또는 PostgREST 오류 발생 시 원시 오류 대신 사용자 친화적 메시지로 표시된다.
- 프로필 미완성 상태에서 TF 생성 진입 시 모달이 작성을 유도한다.

## Performance Criteria

- 프로필 페이지 로드 시 단일 RLS 조회로 초기값을 가져온다.
- 저장 후 캐시가 무효화되어 최신 값이 즉시 반영된다.
