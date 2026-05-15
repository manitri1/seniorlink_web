# Optional SQL seeds

These files are **not** run automatically on `supabase db reset` (except the noop in `../seed.sql`). Execute in **SQL Editor** or `psql` as DB owner / service role when you need extra volume.

| Path | Purpose |
|------|---------|
| `loadtest/moderate.sql` | Moderate load-test dataset (`[SEED-LOADTEST]` / `[SEED] QA시니어`). Requires at least one `public.companies` row. |
| `loadtest/cleanup.sql` | loadtest 태그 및 `[SEED-EMANITRI]` QA 행 삭제(시드 `qa/emanitri.sql` 참고). |
| `qa/emanitri.sql` | `emanitri@gmail.com` QA 픽스처(가입 후 수동 실행). |

See `docs/db-rls.md` and `docs/supabase-migrations.md` for counts and safety notes.
