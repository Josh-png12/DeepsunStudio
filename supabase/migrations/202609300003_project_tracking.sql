-- DeepSun Studio — project tracking model.
-- This migration is additive. Do not edit the already-applied 001/002 migrations.

alter type public.project_status add value if not exists 'potential';
alter type public.project_status add value if not exists 'proposal';
alter type public.project_status add value if not exists 'negotiation';
alter type public.project_status add value if not exists 'contracted';
alter type public.project_status add value if not exists 'paused';

do $$ begin
  create type public.project_health_status as enum ('on_track', 'attention', 'blocked');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.project_update_visibility as enum ('internal', 'investor');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.milestone_status as enum ('pending', 'in_progress', 'completed', 'blocked', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.blocker_severity as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.blocker_status as enum ('open', 'resolved');
exception when duplicate_object then null; end $$;

alter table public.projects
  add column if not exists slug text,
  add column if not exists public_name text,
  add column if not exists client_public_name text,
  add column if not exists service_type text,
  add column if not exists progress_percent integer not null default 0,
  add column if not exists estimated_start_date date,
  add column if not exists estimated_end_date date,
  add column if not exists actual_start_date date,
  add column if not exists investor_visible boolean not null default false,
  add column if not exists next_step text,
  add column if not exists current_focus text,
  add column if not exists health_status public.project_health_status not null default 'on_track',
  add column if not exists created_by uuid references public.profiles(id) on delete restrict;

update public.projects
set
  slug = coalesce(slug, trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) || '-' || left(id::text, 8)),
  public_name = coalesce(public_name, name),
  estimated_start_date = coalesce(estimated_start_date, started_at),
  actual_start_date = coalesce(actual_start_date, started_at),
  progress_percent = case when status::text = 'completed' then 100 else progress_percent end,
  investor_visible = true
where slug is null or public_name is null or investor_visible = false;

alter table public.projects alter column slug set not null;
alter table public.projects alter column public_name set not null;

alter table public.projects drop constraint if exists projects_progress_percent_check;
alter table public.projects add constraint projects_progress_percent_check check (progress_percent between 0 and 100);
alter table public.projects drop constraint if exists projects_estimated_dates_check;
alter table public.projects add constraint projects_estimated_dates_check check (
  estimated_end_date is null or estimated_start_date is null or estimated_end_date >= estimated_start_date
);

create unique index if not exists idx_projects_agreement_slug on public.projects(agreement_id, slug);
create index if not exists idx_projects_visible_status on public.projects(agreement_id, investor_visible, status);

-- Internal notes live in an admin-only relation so row-level policies cannot leak a sensitive column.
create table if not exists public.project_internal_details (
  project_id uuid primary key references public.projects(id) on delete cascade,
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  internal_notes text,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  title text not null check (length(trim(title)) between 3 and 180),
  summary text not null check (length(trim(summary)) between 3 and 600),
  detail text,
  progress_percent integer check (progress_percent is null or progress_percent between 0 and 100),
  status public.project_status,
  current_focus text,
  next_step text,
  visibility public.project_update_visibility not null default 'internal',
  is_highlight boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  title text not null check (length(trim(title)) between 2 and 180),
  description text,
  status public.milestone_status not null default 'pending',
  sort_order integer not null default 0,
  target_date date,
  completed_at timestamptz,
  investor_visible boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  title text not null check (length(trim(title)) between 3 and 180),
  description text not null check (length(trim(description)) between 3 and 2000),
  severity public.blocker_severity not null default 'low',
  status public.blocker_status not null default 'open',
  investor_visible boolean not null default false,
  resolved_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents add column if not exists investor_visible boolean not null default true;
alter table public.audit_logs add column if not exists investor_visible boolean not null default false;
alter table public.user_preferences add column if not exists last_seen_at timestamptz;

update public.audit_logs
set investor_visible = true
where action in ('financial_adjustment', 'status_change', 'document_upload', 'payment_created', 'participation_calculated');

create index if not exists idx_project_updates_project_date on public.project_updates(project_id, created_at desc);
create index if not exists idx_project_updates_investor on public.project_updates(agreement_id, visibility, created_at desc);
create index if not exists idx_project_milestones_project_order on public.project_milestones(project_id, sort_order, created_at);
create index if not exists idx_project_blockers_project_status on public.project_blockers(project_id, status, created_at desc);

create or replace function public.sync_project_tracking_agreement()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_agreement_id uuid;
begin
  select agreement_id into v_agreement_id from public.projects where id = new.project_id;
  if not found then raise exception 'Project not found'; end if;
  new.agreement_id := v_agreement_id;
  return new;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['project_internal_details','project_updates','project_milestones','project_blockers'] loop
    execute format('drop trigger if exists sync_%I_agreement on public.%I', table_name, table_name);
    execute format(
      'create trigger sync_%I_agreement before insert or update of project_id on public.%I for each row execute function public.sync_project_tracking_agreement()',
      table_name, table_name
    );
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;

create or replace function public.apply_project_update_snapshot()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.projects
  set
    progress_percent = coalesce(new.progress_percent, progress_percent),
    status = coalesce(new.status, status),
    current_focus = coalesce(new.current_focus, current_focus),
    next_step = coalesce(new.next_step, next_step),
    actual_start_date = case
      when new.status::text in ('contracted', 'active') then coalesce(actual_start_date, current_date)
      else actual_start_date
    end,
    completed_at = case
      when new.status::text = 'completed' then coalesce(completed_at, current_date)
      else completed_at
    end
  where id = new.project_id;
  return new;
end $$;

drop trigger if exists apply_project_update_snapshot_trigger on public.project_updates;
create trigger apply_project_update_snapshot_trigger
after insert on public.project_updates
for each row execute function public.apply_project_update_snapshot();

create or replace function public.protect_opportunity_finances()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_status text;
begin
  if new.project_id is null then return new; end if;
  select status::text into v_status from public.projects where id = new.project_id;
  if v_status in ('potential', 'proposal', 'negotiation', 'lead') then
    raise exception 'Commercial opportunities cannot create financial ledger entries or participations';
  end if;
  return new;
end $$;

drop trigger if exists protect_opportunity_transactions_trigger on public.transactions;
create trigger protect_opportunity_transactions_trigger
before insert or update of project_id on public.transactions
for each row execute function public.protect_opportunity_finances();

drop trigger if exists protect_opportunity_participations_trigger on public.participations;
create trigger protect_opportunity_participations_trigger
before insert or update of project_id on public.participations
for each row execute function public.protect_opportunity_finances();

create or replace function public.protect_project_financial_phase()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.status::text in ('potential', 'proposal', 'negotiation', 'lead') and (
    exists (select 1 from public.transactions t where t.project_id = new.id)
    or exists (select 1 from public.participations pa where pa.project_id = new.id)
  ) then
    raise exception 'A project with financial history cannot become a commercial opportunity';
  end if;
  return new;
end $$;

drop trigger if exists protect_project_financial_phase_trigger on public.projects;
create trigger protect_project_financial_phase_trigger
before update of status on public.projects
for each row execute function public.protect_project_financial_phase();

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_new jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_agreement uuid := coalesce(nullif(v_new ->> 'agreement_id', '')::uuid, nullif(v_old ->> 'agreement_id', '')::uuid);
  v_entity uuid := coalesce(
    nullif(v_new ->> 'id', '')::uuid,
    nullif(v_old ->> 'id', '')::uuid,
    nullif(v_new ->> 'project_id', '')::uuid,
    nullif(v_old ->> 'project_id', '')::uuid
  );
  v_action text := lower(tg_op);
  v_reason text := coalesce(v_new ->> 'reason', current_setting('app.audit_reason', true));
  v_visible boolean := false;
begin
  if tg_table_name = 'projects' and tg_op = 'INSERT' then v_action := 'project_created'; end if;
  if tg_table_name = 'projects' and tg_op = 'UPDATE' and (v_old ->> 'status') is distinct from (v_new ->> 'status') then v_action := 'project_status_changed'; end if;
  if tg_table_name = 'projects' and tg_op = 'UPDATE' and (v_old ->> 'progress_percent') is distinct from (v_new ->> 'progress_percent') then v_action := 'project_progress_updated'; end if;
  if tg_table_name in ('projects','documents','project_milestones','project_blockers') and tg_op = 'UPDATE'
    and (v_old ->> 'investor_visible') is distinct from (v_new ->> 'investor_visible') then v_action := 'visibility_changed'; end if;
  if tg_table_name = 'project_updates' and tg_op = 'INSERT' then v_action := 'project_update_published'; end if;
  if tg_table_name = 'project_milestones' and tg_op = 'INSERT' then v_action := 'milestone_created'; end if;
  if tg_table_name = 'project_milestones' and tg_op = 'UPDATE' and coalesce(v_old ->> 'status', '') <> 'completed' and (v_new ->> 'status') = 'completed' then v_action := 'milestone_completed'; end if;
  if tg_table_name = 'project_blockers' and tg_op = 'INSERT' then v_action := 'blocker_created'; end if;
  if tg_table_name = 'project_blockers' and tg_op = 'UPDATE' and coalesce(v_old ->> 'status', '') <> 'resolved' and (v_new ->> 'status') = 'resolved' then v_action := 'blocker_resolved'; end if;
  if tg_table_name = 'transactions' and coalesce(v_new ->> 'type', '') = 'adjustment' then v_action := 'financial_adjustment'; end if;
  if tg_table_name = 'transactions' and tg_op = 'UPDATE' and (v_old ->> 'status') is distinct from (v_new ->> 'status') then v_action := 'status_change'; end if;
  if tg_table_name = 'documents' and tg_op = 'INSERT' then v_action := 'document_upload'; end if;
  if tg_table_name = 'payments' and tg_op = 'INSERT' then v_action := 'payment_created'; end if;
  if tg_table_name = 'participations' and tg_op = 'INSERT' then v_action := 'participation_calculated'; end if;

  v_visible := case
    when tg_table_name in ('projects','documents','project_milestones','project_blockers')
      then coalesce((v_new ->> 'investor_visible')::boolean, (v_old ->> 'investor_visible')::boolean, false)
    when tg_table_name = 'project_updates'
      then coalesce(v_new ->> 'visibility', v_old ->> 'visibility') = 'investor'
    when tg_table_name = 'updates'
      then coalesce(v_new ->> 'visibility', v_old ->> 'visibility') = 'members'
    when tg_table_name = 'transactions'
      then coalesce(v_new ->> 'status', v_old ->> 'status') in ('confirmed', 'reversed')
    when tg_table_name in ('participations','payments') then true
    else false
  end;

  insert into public.audit_logs(
    actor_id, agreement_id, entity_type, entity_id, action,
    previous_data, new_data, reason, investor_visible
  ) values (
    auth.uid(), v_agreement, tg_table_name, v_entity, v_action,
    v_old, v_new, v_reason, v_visible
  );
  return case when tg_op = 'DELETE' then old else new end;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['project_updates','project_milestones','project_blockers'] loop
    execute format('drop trigger if exists audit_%I on public.%I', table_name, table_name);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
      table_name, table_name
    );
  end loop;
end $$;

create or replace function public.notify_project_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_project_name text;
  v_type text;
  v_title text;
  v_message text;
begin
  if tg_table_name = 'project_updates' then
    if new.visibility <> 'investor' then return new; end if;
    select coalesce(public_name, name) into v_project_name from public.projects where id = new.project_id;
    v_type := 'project_update'; v_title := 'Nuevo avance en ' || v_project_name; v_message := new.title;
  elsif tg_table_name = 'project_milestones' then
    if new.status <> 'completed' or not new.investor_visible then return new; end if;
    if tg_op = 'UPDATE' and old.status = 'completed' then return new; end if;
    select coalesce(public_name, name) into v_project_name from public.projects where id = new.project_id;
    v_type := 'milestone_completed'; v_title := 'Hito completado en ' || v_project_name; v_message := new.title;
  elsif tg_table_name = 'documents' then
    if not new.investor_visible then return new; end if;
    v_type := 'document'; v_title := 'Nuevo documento disponible'; v_message := new.name;
  elsif tg_table_name = 'updates' then
    if new.visibility <> 'members' then return new; end if;
    v_type := 'update'; v_title := new.title; v_message := left(new.content, 240);
  elsif tg_table_name = 'payments' then
    insert into public.notifications(user_id, agreement_id, type, title, message)
    select new.investor_id, new.agreement_id, 'payment', 'Pago registrado', 'Se registró un pago asociado a tu acuerdo.'
    where exists (
      select 1 from public.user_preferences p where p.user_id = new.investor_id and p.notify_payment
    );
    return new;
  else
    return new;
  end if;

  insert into public.notifications(user_id, agreement_id, type, title, message)
  select m.user_id, new.agreement_id, v_type, v_title, v_message
  from public.agreement_members m
  join public.user_preferences p on p.user_id = m.user_id
  where m.agreement_id = new.agreement_id
    and m.role = 'investor'
    and case when v_type = 'document' then p.notify_document else p.notify_update end;
  return new;
end $$;

drop trigger if exists notify_project_update_trigger on public.project_updates;
create trigger notify_project_update_trigger after insert on public.project_updates
for each row execute function public.notify_project_event();
drop trigger if exists notify_milestone_trigger on public.project_milestones;
create trigger notify_milestone_trigger after insert or update of status on public.project_milestones
for each row execute function public.notify_project_event();
drop trigger if exists notify_document_trigger on public.documents;
create trigger notify_document_trigger after insert on public.documents
for each row execute function public.notify_project_event();
drop trigger if exists notify_update_trigger on public.updates;
create trigger notify_update_trigger after insert on public.updates
for each row execute function public.notify_project_event();
drop trigger if exists notify_payment_trigger on public.payments;
create trigger notify_payment_trigger after insert on public.payments
for each row execute function public.notify_project_event();
