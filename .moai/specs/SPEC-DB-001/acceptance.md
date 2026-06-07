# SPEC-DB-001 인수 기준 (Acceptance Criteria)

## Scenario 1: 코어 스키마 마이그레이션 적용

- **Given** Supabase 프로젝트가 CLI로 link된 상태에서
- **When** `supabase db push` 또는 `20260521110000_core_schema.sql` 마이그레이션이 실행되면
- **Then** profiles, companies, senior_profiles, tf_requests, request_matches, proposals, contracts, settlements, contract_reviews 9개 테이블이 모두 생성되고 관련 enum 타입이 존재한다.

## Scenario 2: 회원가입 시 프로필 자동 생성

- **Given** `on_auth_user_created` 트리거가 활성화된 상태에서
- **When** company 역할로 신규 사용자가 `auth.signUp`을 완료하면
- **Then** profiles에 해당 user의 row가 생성되고 companies 테이블에 연결된 레코드가 자동 생성된다.

## Scenario 3: 역할별 RLS 접근 제어

- **Given** company 사용자 A와 company 사용자 B가 각각 존재하는 상태에서
- **When** 사용자 A가 사용자 B의 tf_requests row를 조회하면
- **Then** RLS 정책에 의해 결과가 반환되지 않는다 (본인 데이터만 접근 가능).

## Scenario 4: RLS 재귀 방지

- **Given** companies와 tf_requests에 RLS 정책이 적용된 상태에서
- **When** company 사용자가 본인의 tf_requests 목록을 조회하면
- **Then** 무한 재귀 오류 없이 정상적으로 결과가 반환된다 (재귀 수정 마이그레이션 적용 확인).

## Edge Cases

- service role key로 접근 시 RLS가 우회되어 전체 데이터에 접근 가능해야 한다 (관리/웹훅 용도).
- enum에 정의되지 않은 값으로 insert를 시도하면 DB 레벨에서 거부된다.
- 트리거 실행 중 오류가 발생하면 회원가입 트랜잭션 전체가 롤백된다.

## Performance Criteria

- 단일 마이그레이션 실행이 정상 완료된다 (오류 0건).
- `npm run lint`와 `npm run build`가 CI에서 성공한다 (exit code 0).
- 기본 인덱스가 있는 테이블의 RLS 조회가 정상 응답한다.
