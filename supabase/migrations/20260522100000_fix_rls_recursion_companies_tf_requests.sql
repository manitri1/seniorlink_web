-- Break RLS infinite recursion: companies_select_senior_via_proposal reads tf_requests,
-- while tf_requests_select_own (and related policies) subqueried companies with full RLS.
-- SECURITY DEFINER read on companies bypasses RLS for that lookup only.

create or replace function public.app_company_ids_for_current_user ()
  returns setof uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select c.id
  from public.companies c
  where c.owner_id = (select auth.uid ());
$$;

comment on function public.app_company_ids_for_current_user () is
  'Company row ids owned by JWT user; used in RLS to avoid companies↔tf_requests policy recursion.';

revoke all on function public.app_company_ids_for_current_user () from public;
grant execute on function public.app_company_ids_for_current_user () to authenticated;
grant execute on function public.app_company_ids_for_current_user () to service_role;

-- --- tf_requests ---
drop policy if exists "tf_requests_select_own" on public.tf_requests;
drop policy if exists "tf_requests_insert_own" on public.tf_requests;
drop policy if exists "tf_requests_update_own" on public.tf_requests;

create policy "tf_requests_select_own" on public.tf_requests for select using (
  company_id in (select public.app_company_ids_for_current_user ())
);
create policy "tf_requests_insert_own" on public.tf_requests for insert with check (
  company_id in (select public.app_company_ids_for_current_user ())
);
create policy "tf_requests_update_own" on public.tf_requests for update using (
  company_id in (select public.app_company_ids_for_current_user ())
)
with check (company_id in (select public.app_company_ids_for_current_user ()));

-- --- request_matches ---
drop policy if exists "request_matches_select_own" on public.request_matches;
drop policy if exists "request_matches_insert_own" on public.request_matches;

create policy "request_matches_select_own" on public.request_matches for select using (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "request_matches_insert_own" on public.request_matches for insert with check (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);

-- --- proposals ---
drop policy if exists "proposals_select_own" on public.proposals;
drop policy if exists "proposals_insert_own" on public.proposals;
drop policy if exists "proposals_update_own" on public.proposals;

create policy "proposals_select_own" on public.proposals for select using (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "proposals_insert_own" on public.proposals for insert with check (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "proposals_update_own" on public.proposals for update using (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
)
with check (
  request_id in (
    select r.id
    from public.tf_requests r
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);

-- --- contracts ---
drop policy if exists "contracts_select_own" on public.contracts;
drop policy if exists "contracts_insert_own" on public.contracts;
drop policy if exists "contracts_update_own" on public.contracts;

create policy "contracts_select_own" on public.contracts for select using (
  proposal_id in (
    select p.id
    from public.proposals p
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "contracts_insert_own" on public.contracts for insert with check (
  proposal_id in (
    select p.id
    from public.proposals p
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "contracts_update_own" on public.contracts for update using (
  proposal_id in (
    select p.id
    from public.proposals p
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
)
with check (
  proposal_id in (
    select p.id
    from public.proposals p
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);

-- --- settlements ---
drop policy if exists "settlements_select_own" on public.settlements;
drop policy if exists "settlements_insert_own" on public.settlements;
drop policy if exists "settlements_update_own" on public.settlements;

create policy "settlements_select_own" on public.settlements for select using (
  contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "settlements_insert_own" on public.settlements for insert with check (
  contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "settlements_update_own" on public.settlements for update using (
  contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
)
with check (
  contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);

-- --- contract_reviews ---
drop policy if exists "contract_reviews_select_own" on public.contract_reviews;
drop policy if exists "contract_reviews_insert_own" on public.contract_reviews;

create policy "contract_reviews_select_own" on public.contract_reviews for select using (
  contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
);
create policy "contract_reviews_insert_own" on public.contract_reviews for insert with check (
  reviewer_id = auth.uid ()
  and contract_id in (
    select ct.id
    from public.contracts ct
      join public.proposals p on ct.proposal_id = p.id
      join public.tf_requests r on p.request_id = r.id
    where r.company_id in (select public.app_company_ids_for_current_user ())
  )
  and exists (select 1 from public.contracts x where x.id = contract_id and x.status = 'completed')
);
