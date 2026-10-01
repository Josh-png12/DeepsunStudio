-- DeepSun Studio — project tracking authorization and selective Realtime.

alter table public.project_internal_details enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_blockers enable row level security;

-- New enum values become usable after migration 003 commits.
alter table public.projects disable trigger audit_projects;
update public.projects p
set status = case
  when p.status::text in ('lead', 'pending') and exists (
    select 1 from public.transactions t where t.project_id = p.id and t.status = 'confirmed'
  ) then 'contracted'::public.project_status
  when p.status::text in ('lead', 'pending') and exists (
    select 1 from public.participations pa where pa.project_id = p.id
  ) then 'contracted'::public.project_status
  when p.status::text = 'lead' then 'potential'::public.project_status
  when p.status::text = 'pending' then 'proposal'::public.project_status
  else p.status
end
where p.status::text in ('lead', 'pending');
alter table public.projects enable trigger audit_projects;

alter table public.projects alter column status set default 'potential';
alter table public.projects drop constraint if exists projects_tracking_status_check;
alter table public.projects add constraint projects_tracking_status_check check (
  status::text in ('potential','proposal','negotiation','contracted','active','paused','completed','cancelled')
);

create or replace function public.project_accepts_financials(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select p_project_id is null or exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and p.status::text in ('contracted','active','paused','completed')
  )
$$;
revoke all on function public.project_accepts_financials(uuid) from public;
grant execute on function public.project_accepts_financials(uuid) to authenticated;

drop policy if exists "projects select members" on public.projects;
drop policy if exists "projects insert admins" on public.projects;
drop policy if exists "projects update admins" on public.projects;
drop policy if exists "projects delete draft-like admins" on public.projects;
create policy "projects select permitted" on public.projects for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (investor_visible and public.is_agreement_member(agreement_id))
);
create policy "projects insert admins" on public.projects for insert to authenticated with check (
  public.is_agreement_admin(agreement_id) and created_by = auth.uid()
);
create policy "projects update admins" on public.projects for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id));
create policy "projects delete draft-like admins" on public.projects for delete to authenticated using (
  public.is_agreement_admin(agreement_id) and status::text in ('potential','proposal','cancelled')
);

drop policy if exists "transactions select members" on public.transactions;
drop policy if exists "transactions insert admins" on public.transactions;
drop policy if exists "transactions update admins" on public.transactions;
create policy "transactions select permitted" on public.transactions for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    public.is_agreement_member(agreement_id)
    and status in ('confirmed','reversed')
    and (project_id is null or exists (
      select 1 from public.projects p where p.id = project_id and p.investor_visible
    ))
  )
);
create policy "transactions insert admins" on public.transactions for insert to authenticated with check (
  public.is_agreement_admin(agreement_id)
  and created_by = auth.uid()
  and public.project_accepts_financials(project_id)
);
create policy "transactions update admins" on public.transactions for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id) and public.project_accepts_financials(project_id));

drop policy if exists "participations select members" on public.participations;
create policy "participations select permitted" on public.participations for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    public.is_agreement_member(agreement_id)
    and exists (
      select 1 from public.projects p where p.id = project_id and p.investor_visible
    )
  )
);

drop policy if exists "payments select members" on public.payments;
create policy "payments select permitted" on public.payments for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    investor_id = auth.uid()
    and public.is_agreement_member(agreement_id)
    and (
      participation_id is null
      or exists (
        select 1
        from public.participations pa
        join public.projects p on p.id = pa.project_id
        where pa.id = participation_id and p.investor_visible
      )
    )
  )
);

drop policy if exists "documents select members" on public.documents;
create policy "documents select permitted" on public.documents for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    investor_visible
    and public.is_agreement_member(agreement_id)
    and (project_id is null or exists (
      select 1 from public.projects p where p.id = project_id and p.investor_visible
    ))
  )
);

drop policy if exists "updates select visible to members" on public.updates;
create policy "updates select visible to members" on public.updates for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    public.is_agreement_member(agreement_id)
    and visibility = 'members'
    and (project_id is null or exists (
      select 1 from public.projects p where p.id = project_id and p.investor_visible
    ))
  )
);

drop policy if exists "audit select members" on public.audit_logs;
create policy "audit select permitted" on public.audit_logs for select to authenticated using (
  agreement_id is not null
  and public.is_agreement_admin(agreement_id)
);

create policy "project internal details admin select" on public.project_internal_details for select to authenticated using (
  public.is_agreement_admin(agreement_id)
);
create policy "project internal details admin insert" on public.project_internal_details for insert to authenticated with check (
  public.is_agreement_admin(agreement_id) and updated_by = auth.uid()
);
create policy "project internal details admin update" on public.project_internal_details for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id) and updated_by = auth.uid());
create policy "project internal details admin delete" on public.project_internal_details for delete to authenticated using (
  public.is_agreement_admin(agreement_id)
);

create policy "project updates select permitted" on public.project_updates for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    visibility = 'investor'
    and public.is_agreement_member(agreement_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.investor_visible)
  )
);
create policy "project updates admin insert" on public.project_updates for insert to authenticated with check (
  public.is_agreement_admin(agreement_id) and created_by = auth.uid()
);
create policy "project updates admin update" on public.project_updates for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id));
create policy "project updates admin delete" on public.project_updates for delete to authenticated using (
  public.is_agreement_admin(agreement_id)
);

create policy "milestones select permitted" on public.project_milestones for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    investor_visible
    and public.is_agreement_member(agreement_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.investor_visible)
  )
);
create policy "milestones admin insert" on public.project_milestones for insert to authenticated with check (
  public.is_agreement_admin(agreement_id) and created_by = auth.uid()
);
create policy "milestones admin update" on public.project_milestones for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id));
create policy "milestones admin delete" on public.project_milestones for delete to authenticated using (
  public.is_agreement_admin(agreement_id)
);

create policy "blockers select permitted" on public.project_blockers for select to authenticated using (
  public.is_agreement_admin(agreement_id)
  or (
    investor_visible
    and public.is_agreement_member(agreement_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.investor_visible)
  )
);
create policy "blockers admin insert" on public.project_blockers for insert to authenticated with check (
  public.is_agreement_admin(agreement_id) and created_by = auth.uid()
);
create policy "blockers admin update" on public.project_blockers for update to authenticated
using (public.is_agreement_admin(agreement_id))
with check (public.is_agreement_admin(agreement_id));
create policy "blockers admin delete" on public.project_blockers for delete to authenticated using (
  public.is_agreement_admin(agreement_id)
);

grant select, insert, update, delete on public.project_internal_details to authenticated;
grant select, insert, update, delete on public.project_updates to authenticated;
grant select, insert, update, delete on public.project_milestones to authenticated;
grant select, insert, update, delete on public.project_blockers to authenticated;

drop policy if exists "storage members read agreement documents" on storage.objects;
create policy "storage permitted read agreement documents" on storage.objects for select to authenticated using (
  bucket_id = 'agreement-documents'
  and (
    public.is_agreement_admin(public.storage_agreement_id(name))
    or exists (
      select 1 from public.documents d
      where d.storage_path = name
        and d.investor_visible
        and public.is_agreement_member(d.agreement_id)
    )
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_updates'
  ) then alter publication supabase_realtime add table public.project_updates; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_milestones'
  ) then alter publication supabase_realtime add table public.project_milestones; end if;
end $$;
