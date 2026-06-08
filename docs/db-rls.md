# DB·RLS 초안 (Phase 0)

마이그레이션: `supabase/migrations/20260521110000_core_schema.sql`(선행 teardown: `20260521100000_drop_app_objects.sql`)

## 테이블

| 테이블 | 용도 |
|--------|------|
| `public.profiles` | `auth.users` 1:1. `role`은 `company` \| `senior`. 웹 가입 시 기본 `company` (`/signup?role=senior` 시 시니어). |
| `public.companies` | 기업 1행. `owner_id` = 해당 사용자 `profiles.id`. 가입 트리거에서 company일 때 생성. |

### `companies` 컬럼 (Phase 3 확장)

| 컬럼 | 설명 |
|------|------|
| `name` | 회사명 (필수) |
| `industry` | 업종 (선택) |
| `description` | 회사 소개 (선택) |
| `website_url` | 웹사이트 URL (선택) |

마이그레이션: `supabase/migrations/20260521110000_core_schema.sql`

### `tf_requests` (Phase 4)

| 컬럼 | 설명 |
|------|------|
| `company_id` | 소유 `companies.id` (RLS로 본인 기업만) |
| `title`, `field`, `region`, `goals` | 요청 개요 |
| `duration_weeks` | 1~104 |
| `budget_min`, `budget_max` | 원 단위, 선택 |
| `status` | `request_status` enum: open, matching, in_progress, completed, cancelled |

마이그레이션: `supabase/migrations/20260521110000_core_schema.sql`

**RLS**: `company_id`가 `auth.uid()` 소유 `companies` 행과 일치하는 행만 select/insert/update.

### `senior_profiles` · `request_matches` · `proposals` (Phase 5)

| 테이블 | 용도 |
|--------|------|
| `senior_profiles` | 기업 매칭용 **페르소나 풀**(`profile_id`가 NULL)과 **로그인 시니어**(`profile_id` = `profiles.id`)가 공존. `authenticated` 읽기; 연결 행은 본인만 `update`. |
| `request_matches` | 요청별 매칭 후보(`fit_score`, `match_reasons`). 기업이 소유한 `tf_requests`에만 연결. |
| `proposals` | 요청별 제안(메시지·상태). 동일 요청+시니어에 대해 **pending**은 최대 1건(부분 유니크 인덱스). |

마이그레이션: `supabase/migrations/20260521110000_core_schema.sql`

| 테이블 | 정책 요지 |
|--------|-----------|
| `senior_profiles` | `senior_profiles_select_authenticated` — 풀·본인 행 읽기 · `senior_profiles_update_own` — 본인 연결 행만 수정 |
| `request_matches` | 기업: insert/select 소유 요청 · 시니어: `request_matches_select_senior_own` |
| `proposals` | 기업: insert/select/update 소유 요청 · 시니어: `proposals_select_senior_involved` / `proposals_update_senior_own` |

## 트리거

- `on_auth_user_created`: `auth.users` insert 후 `handle_new_user()` 실행.
  - `raw_user_meta_data.role`이 없으면 `company`.
  - `company`이면 `companies`에 기본 이름으로 1행 insert.
  - `senior`이면 `senior_profiles`에 `profile_id = new.id`로 1행 insert(기업 행은 만들지 않음).
- 함수·트리거 정의는 `20260521110000_core_schema.sql`에 포함됩니다. `20260521100000_drop_app_objects.sql`이 기존 객체를 먼저 제거합니다.

**이미 가입했는데 `senior_profiles`가 비어 있는 시니어**(트리거 확장 이전 가입 등): 새 마이그레이션만으로는 과거 행이 생기지 않습니다. Supabase **SQL Editor**(DB 소유자)에서 아래처럼 백필하세요.

```sql
INSERT INTO public.senior_profiles (
  display_name, headline, fields, region, years_experience, profile_id
)
SELECT
  coalesce(p.full_name, split_part(u.email, '@', 1), '시니어'),
  '',
  '{}'::text[],
  '서울',
  0,
  p.id
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'senior'
  AND NOT EXISTS (SELECT 1 FROM public.senior_profiles sp WHERE sp.profile_id = p.id);
```

## RLS (authenticated)

| 테이블 | 정책 | 내용 |
|--------|------|------|
| `profiles` | `profiles_select_own` | `id = auth.uid()` |
| `profiles` | `profiles_update_own` | 본인 행만 update |
| `companies` | `companies_select_own` | `owner_id = auth.uid()` |
| `companies` | `companies_insert_own` | 본인 소유로만 insert |
| `companies` | `companies_update_own` | 본인 소유만 update |
| `tf_requests` | `tf_requests_select_own` | `company_id` ∈ 본인 `companies` |
| `tf_requests` | `tf_requests_insert_own` | 동일 |
| `tf_requests` | `tf_requests_update_own` | 동일 |
| `senior_profiles` | `senior_profiles_select_authenticated` | `authenticated` select 허용(MVP 풀 + 시니어 본인 행) |
| `senior_profiles` | `senior_profiles_update_own` | `profile_id = auth.uid()` 인 행만 update |
| `proposals` | `proposals_select_senior_involved` | 제안의 `senior_id`가 본인 `senior_profiles`와 연결된 경우 select |
| `proposals` | `proposals_update_senior_own` | 동일 조건에서 update(수락/거절 등) |
| `tf_requests` | `tf_requests_select_senior_invited` | 본인에게 제안이 온 요청만 select |
| `companies` | `companies_select_senior_via_proposal` | 위 요청의 기업 정보만 select |
| `request_matches` | `request_matches_select_senior_own` | 본인 `senior_id` 매칭 행만 select |
| `contracts` | `contracts_select_senior_involved` | 본인 제안 체인의 계약만 select |
| `settlements` | `settlements_select_senior_involved` | 본인 계약의 정산만 select |
| `contract_reviews` | `contract_reviews_select_senior_subject` | 피평가 시니어로서 본인 후기만 select |
| `request_matches` | `request_matches_select_own` | 본인 기업 요청의 매칭만 |
| `request_matches` | `request_matches_insert_own` | 동일 소유 요청에만 insert |
| `proposals` | `proposals_select_own` | 본인 기업 요청의 제안만 |
| `proposals` | `proposals_insert_own` | 동일 |
| `proposals` | `proposals_update_own` | 동일(철회 등) |
| `contracts` | `contracts_select_own` 등 | `proposal_id`가 본인 기업 요청 체인에 속할 때만 |
| `settlements` | `settlements_select_own` 등 | 소속 `contract_id`가 본인 기업 계약일 때만 |
| `contract_reviews` | `contract_reviews_select_own` | 본인 기업 계약의 후기 조회 |
| `contract_reviews` | `contract_reviews_insert_own` | `reviewer_id = auth.uid()` 이고 계약 `completed` 인 경우만 insert |

트리거 함수는 `security definer`이므로 가입 시 `profiles`/`companies` 삽입은 RLS를 우회한다.

### `contracts` · `settlements` · `contract_reviews` (Phase 6)

| 테이블 | 컬럼 | 용도 |
|--------|------|------|
| `contracts` | `id`, `proposal_id` (FK), `status` (contract_status enum: draft/active/settlement_requested/completed/cancelled), `company_id`, `senior_profile_id`, `request_id`, `start_date`, `end_date`, `total_amount`, `progress_pct`, `pdf_url` | `proposals` 1:1. 기간·역할·보수·PDF URL·진행률·상태 |
| `settlements` | `id`, `contract_id` (FK), `status` (settlement_status enum: pending/released/completed/failed), `amount`, `paid_at`, `toss_*` (선택) | `contracts` 1:1. 금액·정산 상태·결제 정보 |
| `contract_reviews` | `id`, `contract_id` (FK), `company_id`, `senior_id`, `rating` (1~5), `comment` | 계약 완료 후 기업(`reviewer_id`)이 시니어에 남기는 후기 |

마이그레이션: `supabase/migrations/20260521110000_core_schema.sql`

#### RLS (contracts · settlements · contract_reviews)

| 테이블 | 정책 | 내용 |
|--------|------|------|
| `contracts` | `contracts_select_own` (기업) | `company_id`가 본인 소유 `companies` 행과 일치할 때 select |
| `contracts` | `contracts_select_senior_involved` (시니어) | `senior_profile_id`가 본인 `senior_profiles`와 연결되었을 때 select |
| `contracts` | `contracts_insert_own` (기업) | 본인 기업 소유 제안 체인에만 insert |
| `contracts` | `contracts_update_own` (기업) | 본인 기업 계약만 update |
| `settlements` | `settlements_select_own` (기업) | 소속 `contract_id`가 본인 기업 계약일 때만 select |
| `settlements` | `settlements_select_senior_involved` (시니어) | 본인 계약의 정산만 select |
| `settlements` | `settlements_insert_own` (기업) | 본인 계약만 insert |
| `settlements` | `settlements_update_own` (기업) | 본인 계약 정산만 update |
| `contract_reviews` | `contract_reviews_select_own` (기업) | 본인 기업 계약의 후기 조회 |
| `contract_reviews` | `contract_reviews_select_senior_subject` (시니어) | 피평가 시니어로서 본인 후기만 select |
| `contract_reviews` | `contract_reviews_insert_own` (기업) | `reviewer_id = auth.uid()` 이고 계약 `completed`일 때만 insert |

## Storage · RPC (Phase 6)

### `contracts` Storage 버킷 (비공개, PDF 전용)

마이그레이션: `supabase/migrations/20260607000002_add_contracts_storage_bucket.sql`

| 정책 | 역할 | 내용 |
|------|------|------|
| `contracts_insert_service_role` | service_role | PDF 파일 insert만 허용(app role은 불가) |
| `contracts_select_authenticated` | authenticated | 소유 계약 또는 제안 관련 시니어만 select |

용도: 기업이 계약 PDF를 생성하면 **service role**로 Storage에 업로드, 경로 `/contracts/{contract_id}/{filename}`에 저장.

### `populate_request_matches` RPC

마이그레이션: `supabase/migrations/20260607000001_add_populate_request_matches_rpc.sql`

```sql
rpc('populate_request_matches', { request_id: uuid })
```

- **실행자**: service_role만(client·anon 불가)
- **역할**: AI 매칭 결과를 `request_matches` 테이블에 삽입(기존 행 제거 후 갱신)
- **호출처**: 서버 API Route(`/api/webhooks/matching` 등) 또는 cron job에서만

## 이후 Phase

- 결제·웹훅·Storage PDF 등은 Route Handler·service role 정책을 별도 절로 정리한다.
- 서버 전용 작업은 `SUPABASE_SERVICE_ROLE_KEY`를 쓰는 Route Handler·Edge Function에서만 수행한다.

## 적정 볼륨 부하 시드 (local / staging only)

대시보드 목록·필터·집계·가벼운 E2E를 **테이블마다 100건** 없이 검증하기 위한 고정 볼륨입니다. **프로덕션에는 실행하지 않습니다.**

**전제**: `public.companies`에 최소 1행(예: 기업 계정 1회 가입). 시드는 `created_at`이 가장 이른 `companies.id` 한 곳에만 `tf_requests`를 붙입니다.

| 단계 | 테이블 | 건수 | 식별 |
| --- | --- | --- | --- |
| A | `senior_profiles` | +50 | `display_name`이 `[SEED] QA시니어 %` 형태 |
| B | `tf_requests` | 40 | `title`·`goals`에 `[SEED-LOADTEST]` 포함 |
| C | `request_matches` | 40 | 위 요청·시니어에 대해 1:1 매핑 |
| D | `proposals` | 40 | pending 22 / accepted 10 / rejected 4 / withdrawn 4 |
| E | `contracts` | 10 | accepted 제안 10건만 |
| F | `settlements` | 10 | 계약 1:1, 상태 분산 |
| G | `contract_reviews` | 5 | `completed` 계약 5건, `reviewer_id` = 해당 기업 `owner_id` |

**실행**

- 파일: `supabase/seeds/loadtest/moderate.sql`
- Supabase **SQL Editor** 또는 `psql`로 **한 번 실행**. 재실행 시 동일 태그 행을 먼저 지운 뒤 다시 넣습니다.
- **역할**: `senior_profiles`는 마이그레이션상 `authenticated`에게 **insert 권한이 없으므로**, 대시보드 SQL Editor의 DB 소유자·`postgres`·service role 경로로 실행하는 것을 전제로 합니다(로컬 `supabase db`도 동일).

**삭제만 할 때**

- `supabase/seeds/loadtest/cleanup.sql` 실행, 또는 아래와 동등합니다.

```sql
DELETE FROM public.tf_requests WHERE title LIKE '[SEED-LOADTEST] TF요청%';
DELETE FROM public.senior_profiles WHERE display_name LIKE '[SEED] QA시니어 %';
```

`tf_requests` 삭제는 하위 `request_matches`·`proposals`·`contracts`·`settlements`·`contract_reviews`를 **CASCADE**로 정리합니다. 그다음 시드 전용 시니어만 삭제합니다(`contract_reviews.senior_id`는 시니어 삭제 시 restrict이므로, 반드시 위 순서를 지킵니다).

**마이그레이션에 동일 INSERT를 넣지 않는 이유**: `db push` 재적용 시 중복·실패 위험이 있어, 대량 시드는 **`supabase/seeds/**` 아래 SQL을 수동 실행**하는 것이 기본입니다(자세한 운영은 [supabase-migrations.md](./supabase-migrations.md)).

**다중 기업·대량 `auth.users`**: 본 시드는 **단일 기업** 가정입니다. 기업 N곳 × 요청 M건처럼 `auth.users`·`profiles`·`companies`를 대량으로 만들려면 Supabase **Admin API** 등으로 별도 스크립트를 두는 것이 맞고, 이 문서의 시드 범위 밖입니다. 부하 시드용 `senior_profiles` 행은 `profile_id`가 **NULL**(페르소나 풀)이며, 로그인 시니어와는 별개입니다.

**개인 QA 계정 (`emanitri@gmail.com`)**: `supabase/seeds/qa/emanitri.sql`을 SQL Editor에서 실행합니다. `[SEED-EMANITRI]` 접두의 `tf_requests`·제안·(시니어 역할 시)계약을 넣습니다. 해당 이메일로 **가입한 뒤** 시드를 실행하세요.
