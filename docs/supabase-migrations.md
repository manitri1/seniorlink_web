# Supabase 마이그레이션 가이드

이 저장소의 DB 스키마는 `supabase/migrations/` 아래 **버전 관리된 SQL 파일**로 관리합니다. Supabase 대시보드에서 수동으로 바꾼 내용과 파일이 어긋나면 재현이 어려워지므로, **스키마 변경은 마이그레이션으로만 반영**하는 것을 권장합니다.

## 사전 준비

1. [Supabase CLI](https://supabase.com/docs/guides/cli) 설치  
   - 전역: `npm install -g supabase`  
   - 또는 프로젝트에서만: `npx supabase --version`
2. Supabase 프로젝트(클라우드)가 있고, [`.env.example`](../.env.example)에 맞춰 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 로컬에 설정해 둡니다.
3. **서비스 롤 키**(`SUPABASE_SERVICE_ROLE_KEY`)는 Git에 넣지 말고, 서버·CI에서만 사용합니다. 마이그레이션 적용에는 보통 필요 없습니다(대시보드·CLI가 DB에 직접 적용).

## 마이그레이션 파일 규칙

| 항목 | 설명 |
|------|------|
| 위치 | `supabase/migrations/` |
| 이름 | `YYYYMMDDHHMMSS_설명.sql` 형태. 같은 초에 여러 파일이 있으면 **파일명 전체 문자열 순서**로 실행됩니다. |
| 내용 | `create table if not exists`, `drop policy if exists` … 처럼 **재실행·리뷰에 유리한 패턴**을 쓰는 것을 권장합니다. |
| 순서 | 아래 **현재 체인**을 지킵니다. 빈 DB에는 이 순서대로 적용합니다. |

### 현재 마이그레이션 체인(적용 순서)

1. `20260521100000_drop_app_objects.sql` — 앱 테이블·enum·`handle_new_user`·`on_auth_user_created` 제거(`IF EXISTS`, 빈 DB에서도 무해).  
2. `20260521110000_core_schema.sql` — **통합 스키마**(기존 8개 마이그레이션 단일화): profiles/companies(확장 컬럼 포함), TF, 매칭·제안, 계약·정산·후기, 시니어 `profile_id`·RLS·가입 트리거·MVP 시니어 5명.

**QA 시드 (`emanitri@gmail.com`)** 는 마이그레이션에서 제외했습니다. `supabase/seeds/qa/emanitri.sql` 을 SQL Editor에서 수동 실행하세요.

**정리**: `db reset` 시 위 2파일이 순서대로 실행된 뒤 `seed.sql`이 실행됩니다.

### 기존 원격 DB에 예전 8개 마이그레이션이 적용된 경우(브레이킹)

저장소에서 예전 타임스탬프(`20260514` … `20260520`) 파일을 제거했으므로, **원격 `schema_migrations`와 로컬 파일 목록이 어긋날 수 있습니다.** 선택지는 다음 중 하나입니다.

- **새 프로젝트 / 로컬만**: `npx supabase db reset` 으로 재생성.  
- **기존 원격 유지 + 새 체인으로 맞춤**: Supabase CLI `migration repair` 로 제거된 버전을 `reverted` 처리한 뒤 `db push` 하거나, 팀 정책에 따라 원격 DB를 백업 후 마이그레이션 이력을 정리합니다. ([Supabase migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair))

RLS·테이블 요약은 [db-rls.md](db-rls.md)를 참고합니다.

## `db reset` 시 시드(`seed.sql`)

`supabase/seed.sql`은 마이그레이션 직후 **한 번** 실행되며, 기본값은 `select 1` 수준의 noop입니다(깨끗한 리셋에 `companies` 가정이 없음). 부하용 대량 데이터는 `supabase/seeds/loadtest/moderate.sql` 등을 **수동**으로 실행합니다. 상세는 `supabase/seeds/README.md`를 참고하세요.

## 로컬에서 “테이블 삭제 후” 마이그레이션 단계 적용

로컬 Docker DB는 **`npx supabase db reset`** 이 DB를 통째로 다시 만들고, `supabase/migrations/` 아래 SQL을 **파일명(타임스탬프) 순**으로 한 번에 적용합니다. 별도로 `public`만 `DROP`할 필요가 없습니다.

### 한 번에 전체 적용(권장)

```bash
npx supabase start
npx supabase db reset --yes
```

### 마이그레이션 파일마다 끊어서 검증(느림)

CLI의 **`--version`** 은 “해당 타임스탬프**까지**의 마이그레이션만 적용한 상태”로 로컬 DB를 맞춥니다. 매번 DB가 재생성됩니다.

```bash
npx supabase db reset --version 20260521100000 --yes
npx supabase db reset --version 20260521110000 --yes
```

저장소 스크립트(Windows PowerShell):

```powershell
.\supabase\scripts\stepwise-db-reset.ps1 -Stepwise        # 전 파일 순차
.\supabase\scripts\stepwise-db-reset.ps1 -Stepwise -Pause  # 단계마다 Enter
.\supabase\scripts\stepwise-db-reset.ps1                  # 일반 전체 reset 한 번
```

npm: `npm run db:reset` · `npm run db:reset:stepwise`

**주의**: `db reset --linked` 는 **연결된 원격 프로젝트**까지 초기화할 수 있어 프로덕션에서 사용하면 위험합니다. 원격은 `db push`로 마이그레이션만 맞추는 것이 일반적입니다.

## 적용 방법 A: Supabase CLI로 원격 DB에 반영(권장)

원격 프로젝트에 로컬 `migrations` 폴더 내용을 맞추려면 **링크 후 푸시**가 일반적입니다.

### 1) 프로젝트 루트에서 Supabase 초기화(최초 1회)

저장소에 `supabase/config.toml`이 없다면:

```bash
cd e:\work\Modu\seniorlink_web
npx supabase init
```

기본값으로 두어도 됩니다. `migrations` 폴더는 이미 있으므로 **덮어쓰지 않도록** 프롬프트를 확인합니다.

### 2) 로그인·프로젝트 연결

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF`는 대시보드 URL `https://supabase.com/dashboard/project/<ref>`의 `<ref>`입니다.

### 3) 마이그레이션 푸시

```bash
npx supabase db push
```

- 로컬 `supabase/migrations`에만 있고 원격 `supabase_migrations.schema_migrations`에 없는 파일이 **순서대로** 실행됩니다.  
- 이미 적용된 파일은 건너뜁니다.

### 4) 상태 확인

```bash
npx supabase migration list
```

로컬과 원격의 적용 여부를 비교할 수 있습니다(버전에 따라 출력 형식이 다를 수 있음).

## 적용 방법 B: SQL Editor에서 수동 실행

CLI 없이 진행할 때:

1. Supabase 대시보드 → **SQL Editor**  
2. 위 **체인 순서**대로 파일 내용을 **한 파일씩** 실행합니다.  
3. 중간에 실패하면 오류 메시지를 기준으로 수정한 뒤, **이미 성공한 구문은 중복 실행되지 않게** 파일을 조정하거나 복구용 마이그레이션을 새로 만듭니다.

주의: 대시보드에서만 스키마를 바꾸고 로컬 SQL을 갱신하지 않으면, 나중에 `db push` 시 충돌·누락이 생기기 쉽습니다.

## 새 마이그레이션 추가하기

1. **새 타임스탬프 파일**을 만듭니다. 예:

   ```bash
   npx supabase migration new add_my_feature
   ```

   생성된 `supabase/migrations/<timestamp>_add_my_feature.sql`에 DDL·RLS·인덱스 등을 작성합니다.

2. 로컬에서 검증할 때는 **로컬 Supabase**(`npx supabase start`)로 올린 뒤 `db reset`으로 전체 마이그레이션을 처음부터 돌려보는 방법이 안전합니다(데이터는 초기화됨).

3. 검토 후 원격에는 `db push` 또는 PR 머지 후 CI에서 푸시(팀 정책에 따름).

## 롤백에 대해

Postgres는 “이전 마이그레이션으로 자동 롤백”을 표준으로 제공하지 않습니다. 되돌리려면:

- **새 마이그레이션**에서 `drop`·`alter ... drop column` 등으로 이전 상태를 재현하거나,  
- 백업에서 복구합니다.

프로덕션에서는 배포 전 **스테이징**에서 동일 체인을 한 번 돌려보는 것을 권장합니다.

## 자주 겪는 이슈

| 증상 | 점검 |
|------|------|
| `relation already exists` | 해당 마이그레이션이 이미 반영됨. 중복 실행 여부·다른 경로(수동 SQL) 적용 여부 확인. |
| RLS 때문에 앱에서 insert 불가 | [db-rls.md](db-rls.md) 정책과 `auth.uid()`·소유 체인(기업·요청 등)이 코드와 일치하는지 확인. |
| `db push`가 스키마 drift를 보고함 | 대시보드에서만 바꾼 객체가 있음. `supabase db pull`로 스냅샷을 맞추거나(팀 규칙에 따라), 수동 변경을 마이그레이션 파일로 옮김. |

## 대량 테스트 시드 (마이그레이션 비권장)

목록·필터·대시보드 부하 검증용 데이터는 **`supabase/seeds/loadtest/moderate.sql`** 에 두고, **SQL Editor 또는 `psql`로 수동 실행**합니다. `db push`마다 돌리는 마이그레이션에 동일 `INSERT`를 넣으면 재적용 시 중복·제약 충돌이 나기 쉽습니다.

- 표준 건수·전제·삭제 절: [db-rls.md](db-rls.md)의 「적정 볼륨 부하 시드」  
- 시드만 제거: `supabase/seeds/loadtest/cleanup.sql`

## 관련 문서

- [db-rls.md](db-rls.md) — 테이블·RLS 요약  
- [task.md](task.md) — Phase별 구현 계획  
- [Supabase: Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
