-- REQ-MATCH-002: 분야·지역 기반 매칭 RPC
-- SECURITY DEFINER로 실행해 request_matches에 대한 UPDATE 권한 및
-- senior_profiles 전체 읽기 권한을 안전하게 처리합니다.
-- 내부에서 auth.uid()로 기업 소유권을 직접 검증합니다.
create or replace function public.populate_request_matches(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_field  text;
  v_region text;
begin
  -- 소유권 확인: 현재 사용자가 해당 TF 요청을 소유해야 실행 가능
  select r.field, r.region
    into v_field, v_region
    from tf_requests r
    join companies c on r.company_id = c.id
   where r.id = p_request_id
     and c.owner_id = auth.uid();

  if not found then
    raise exception '요청을 찾을 수 없거나 접근 권한이 없습니다.';
  end if;

  -- 분야·지역 기반 점수 계산 후 upsert (기존 행은 점수·사유 갱신)
  insert into request_matches (request_id, senior_id, fit_score, match_reasons)
  select
    p_request_id,
    sp.id,
    case
      when v_field is not null and sp.fields @> array[v_field] and sp.region = v_region then 0.90
      when v_field is not null and sp.fields @> array[v_field]                           then 0.75
      when sp.region = v_region                                                           then 0.55
      else 0.40
    end as fit_score,
    array_remove(
      array[
        case when v_field is not null and sp.fields @> array[v_field]
             then '요청 분야(' || v_field || ')와 경력 분야가 일치합니다.' end,
        case when sp.region = v_region
             then '근무 지역(' || v_region || ')이 요청과 일치합니다.' end,
        case when sp.years_experience >= 5
             then '5년 이상 경력자입니다.' end
      ],
      null
    ) as match_reasons
  from senior_profiles sp
  on conflict (request_id, senior_id) do update
    set fit_score     = excluded.fit_score,
        match_reasons = excluded.match_reasons;
end;
$$;

comment on function public.populate_request_matches(uuid) is
  '분야·지역 기반 매칭을 실행하고 request_matches를 채웁니다. 기업 소유자만 호출 가능.';

revoke all    on function public.populate_request_matches(uuid) from public;
grant execute on function public.populate_request_matches(uuid) to authenticated;
grant execute on function public.populate_request_matches(uuid) to service_role;
