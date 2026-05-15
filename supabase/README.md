# Supabase (Seniorlink web)

- **`migrations/`** — versioned schema, RLS, triggers. Apply with `supabase db push` (remote) or applied automatically on `supabase db reset` (local). Only `*.sql` files whose names match `<timestamp>_name.sql` are applied; do not add non-migration files here.
- **`seed.sql`** — runs once after migrations on `db reset`; kept minimal (`select 1`) so a clean reset does not require `companies` or auth fixtures.
- **`seeds/`** — optional bulk SQL (e.g. load test). See `seeds/README.md`.

## Migration chain (filename order)

| # | File |
|---|------|
| 1 | `20260521100000_drop_app_objects.sql` |
| 2 | `20260521110000_core_schema.sql` |

설명·원격 이행: `docs/supabase-migrations.md`.

Useful commands (from repo root):

```bash
npx supabase start
npx supabase db reset
npx supabase db push
npx supabase migration list
```

## 로컬 DB를 비우고 마이그레이션만 단계 적용

- **한 번에 전체 적용(일반)**: `npx supabase db reset --yes` — DB를 새로 만들고 `migrations/*.sql` 전부 + `seed.sql` 적용.
- **마이그레이션 파일마다 순서 검증**: `supabase/scripts/stepwise-db-reset.ps1 -Stepwise` (선택 `-Pause`). 내부적으로 각 단계마다 `db reset --version <타임스탬프>`로 DB를 재생성하므로 **느리며 로컬 전용**입니다.
- npm: `npm run db:reset` / `npm run db:reset:stepwise`

원격 DB를 비우려면 대시보드·백업 정책에 따르세요. `db reset --linked`는 데이터 전부 삭제에 가깝습니다.
