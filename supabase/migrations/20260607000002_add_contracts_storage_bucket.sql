-- contracts Storage 버킷 생성 (비공개, PDF 전용, 최대 10 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contracts',
  'contracts',
  false,
  10485760,
  '{application/pdf}'
)
on conflict (id) do nothing;

-- service_role: 업로드 허용
create policy "contracts_insert_service_role"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'contracts');

-- authenticated: 목록·다운로드 허용 (서명 URL 보조 정책)
create policy "contracts_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'contracts');
