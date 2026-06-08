-- profiles: 본인 INSERT 허용
-- 트리거(handle_new_user)가 Supabase 프로젝트에 미적용된 경우
-- 클라이언트(signup 액션)에서 직접 행을 생성할 수 있도록 합니다.
-- on_conflict_do_nothing upsert를 사용하므로 트리거가 먼저 행을 만들었다면 덮어쓰지 않습니다.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
