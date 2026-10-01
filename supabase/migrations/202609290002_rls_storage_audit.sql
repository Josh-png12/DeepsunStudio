-- DeepSun Studio — authorization, ledger controls, audit and private Storage.

create or replace function public.is_platform_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.profiles where id = p_user_id and role = 'admin') $$;

create or replace function public.is_agreement_member(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.agreement_members where agreement_id = p_agreement_id and user_id = p_user_id) $$;

create or replace function public.is_agreement_admin(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_admin(p_user_id) or exists(
    select 1 from public.agreement_members
    where agreement_id = p_agreement_id and user_id = p_user_id and role = 'admin'
  )
$$;

revoke all on function public.is_platform_admin(uuid) from public;
revoke all on function public.is_agreement_member(uuid, uuid) from public;
revoke all on function public.is_agreement_admin(uuid, uuid) from public;
grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.is_agreement_member(uuid, uuid) to authenticated;
grant execute on function public.is_agreement_admin(uuid, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.agreements enable row level security;
alter table public.agreement_members enable row level security;
alter table public.projects enable row level security;
alter table public.transactions enable row level security;
alter table public.participations enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.updates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;
alter table public.personal_expenses enable row level security;
alter table public.savings_goals enable row level security;
alter table public.reminders enable row level security;

create policy "profiles select relevant" on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_platform_admin() or exists (
    select 1 from public.agreement_members mine
    join public.agreement_members theirs on theirs.agreement_id = mine.agreement_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id
  )
);
create policy "profiles update self or platform admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

create policy "agreements select members" on public.agreements for select to authenticated
using (public.is_agreement_member(id));
create policy "agreements insert platform admins" on public.agreements for insert to authenticated
with check (public.is_platform_admin());
create policy "agreements update agreement admins" on public.agreements for update to authenticated
using (public.is_agreement_admin(id)) with check (public.is_agreement_admin(id));

create policy "agreement members select peers" on public.agreement_members for select to authenticated
using (public.is_agreement_member(agreement_id));
create policy "agreement members insert admins" on public.agreement_members for insert to authenticated
with check (public.is_agreement_admin(agreement_id));
create policy "agreement members update admins" on public.agreement_members for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));
create policy "agreement members delete admins" on public.agreement_members for delete to authenticated
using (public.is_agreement_admin(agreement_id) and user_id <> auth.uid());

create policy "projects select members" on public.projects for select to authenticated
using (public.is_agreement_member(agreement_id));
create policy "projects insert admins" on public.projects for insert to authenticated
with check (public.is_agreement_admin(agreement_id));
create policy "projects update admins" on public.projects for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));
create policy "projects delete draft-like admins" on public.projects for delete to authenticated
using (public.is_agreement_admin(agreement_id) and status in ('lead','cancelled'));

create policy "transactions select members" on public.transactions for select to authenticated
using (public.is_agreement_member(agreement_id));
create policy "transactions insert admins" on public.transactions for insert to authenticated
with check (public.is_agreement_admin(agreement_id) and created_by = auth.uid());
create policy "transactions update admins" on public.transactions for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));
create policy "transactions delete drafts" on public.transactions for delete to authenticated
using (public.is_agreement_admin(agreement_id) and status = 'draft');

create policy "participations select members" on public.participations for select to authenticated
using (public.is_agreement_admin(agreement_id) or (investor_id = auth.uid() and public.is_agreement_member(agreement_id)));
create policy "participations insert admins" on public.participations for insert to authenticated
with check (public.is_agreement_admin(agreement_id));
create policy "participations update admins" on public.participations for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));

create policy "payments select members" on public.payments for select to authenticated
using (public.is_agreement_admin(agreement_id) or (investor_id = auth.uid() and public.is_agreement_member(agreement_id)));
create policy "payments insert admins" on public.payments for insert to authenticated
with check (public.is_agreement_admin(agreement_id) and created_by = auth.uid());
create policy "payments update admins" on public.payments for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));

create policy "documents select members" on public.documents for select to authenticated
using (public.is_agreement_member(agreement_id));
create policy "documents insert admins" on public.documents for insert to authenticated
with check (public.is_agreement_admin(agreement_id) and uploaded_by = auth.uid());
create policy "documents update admins" on public.documents for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));
create policy "documents delete admins" on public.documents for delete to authenticated
using (public.is_agreement_admin(agreement_id));

create policy "updates select visible to members" on public.updates for select to authenticated using (
  public.is_agreement_member(agreement_id)
  and (visibility = 'members' or public.is_agreement_admin(agreement_id))
);
create policy "updates insert admins" on public.updates for insert to authenticated
with check (public.is_agreement_admin(agreement_id) and created_by = auth.uid());
create policy "updates update admins" on public.updates for update to authenticated
using (public.is_agreement_admin(agreement_id)) with check (public.is_agreement_admin(agreement_id));

create policy "audit select members" on public.audit_logs for select to authenticated
using (agreement_id is not null and public.is_agreement_member(agreement_id));

create policy "notifications own select" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "preferences own select" on public.user_preferences for select to authenticated using (user_id = auth.uid());
create policy "preferences own insert" on public.user_preferences for insert to authenticated with check (user_id = auth.uid());
create policy "preferences own update" on public.user_preferences for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "expenses own select" on public.personal_expenses for select to authenticated using (user_id = auth.uid());
create policy "expenses own insert" on public.personal_expenses for insert to authenticated with check (user_id = auth.uid());
create policy "expenses own update" on public.personal_expenses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "expenses own delete" on public.personal_expenses for delete to authenticated using (user_id = auth.uid());
create policy "goals own select" on public.savings_goals for select to authenticated using (user_id = auth.uid());
create policy "goals own insert" on public.savings_goals for insert to authenticated with check (user_id = auth.uid());
create policy "goals own update" on public.savings_goals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals own delete" on public.savings_goals for delete to authenticated using (user_id = auth.uid());
create policy "reminders own select" on public.reminders for select to authenticated using (user_id = auth.uid());
create policy "reminders own insert" on public.reminders for insert to authenticated with check (user_id = auth.uid());
create policy "reminders own update" on public.reminders for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reminders own delete" on public.reminders for delete to authenticated using (user_id = auth.uid());

create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.id <> old.id then raise exception 'Profile id cannot change'; end if;
  if new.role <> old.role and not public.is_platform_admin(auth.uid()) then
    raise exception 'Only a platform admin can change roles';
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger before update on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.protect_confirmed_transaction()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' and old.status <> 'draft' then
    raise exception 'Only draft transactions can be deleted';
  end if;
  if tg_op = 'UPDATE' and old.status in ('confirmed','reversed') then
    raise exception 'Confirmed ledger entries are immutable; create an adjustment instead';
  end if;
  if tg_op = 'UPDATE' and new.type = 'adjustment' and length(trim(coalesce(new.reason, ''))) < 5 then
    raise exception 'A reason is required for financial adjustments';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
drop trigger if exists protect_confirmed_transaction_trigger on public.transactions;
create trigger protect_confirmed_transaction_trigger before update or delete on public.transactions
for each row execute function public.protect_confirmed_transaction();

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_new jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_agreement uuid := coalesce((v_new ->> 'agreement_id')::uuid, (v_old ->> 'agreement_id')::uuid);
  v_entity uuid := coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid);
  v_action text := lower(tg_op);
  v_reason text := coalesce(v_new ->> 'reason', current_setting('app.audit_reason', true));
begin
  if tg_table_name = 'transactions' and coalesce(v_new ->> 'type', '') = 'adjustment' then v_action := 'financial_adjustment'; end if;
  if tg_table_name = 'transactions' and tg_op = 'UPDATE' and (v_old ->> 'status') is distinct from (v_new ->> 'status') then v_action := 'status_change'; end if;
  if tg_table_name = 'documents' and tg_op = 'INSERT' then v_action := 'document_upload'; end if;
  if tg_table_name = 'payments' and tg_op = 'INSERT' then v_action := 'payment_created'; end if;
  if tg_table_name = 'participations' and tg_op = 'INSERT' then v_action := 'participation_calculated'; end if;
  insert into public.audit_logs(actor_id, agreement_id, entity_type, entity_id, action, previous_data, new_data, reason)
  values (auth.uid(), v_agreement, tg_table_name, v_entity, v_action, v_old, v_new, v_reason);
  return case when tg_op = 'DELETE' then old else new end;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['agreements','agreement_members','projects','transactions','participations','payments','documents','updates'] loop
    execute format('drop trigger if exists audit_%I on public.%I', table_name, table_name);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
      table_name, table_name
    );
  end loop;
end $$;

create or replace function public.calculate_project_participation(
  p_project_id uuid,
  p_investor_id uuid,
  p_reason text default 'Cálculo basado en movimientos confirmados'
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_agreement public.agreements%rowtype;
  v_project public.projects%rowtype;
  v_previous public.participations%rowtype;
  v_gross numeric(16,2) := 0;
  v_costs numeric(16,2) := 0;
  v_refunds numeric(16,2) := 0;
  v_chargebacks numeric(16,2) := 0;
  v_adjustments numeric(16,2) := 0;
  v_net numeric(16,2) := 0;
  v_raw_amount numeric(16,2) := 0;
  v_accumulated numeric(16,2) := 0;
  v_final_amount numeric(16,2) := 0;
  v_result uuid;
begin
  select * into v_project from public.projects where id = p_project_id;
  if not found then raise exception 'Project not found'; end if;
  if not public.is_agreement_admin(v_project.agreement_id) then raise exception 'Not authorized'; end if;
  if not exists(select 1 from public.agreement_members where agreement_id = v_project.agreement_id and user_id = p_investor_id and role = 'investor') then
    raise exception 'Investor is not a member of this agreement';
  end if;
  select * into v_agreement from public.agreements where id = v_project.agreement_id for update;

  select
    coalesce(sum(amount) filter (where type = 'income'), 0),
    coalesce(sum(amount) filter (where type = 'cost'), 0),
    coalesce(sum(amount) filter (where type = 'refund'), 0),
    coalesce(sum(amount) filter (where type = 'chargeback'), 0),
    coalesce(sum(amount) filter (where type = 'adjustment'), 0)
  into v_gross, v_costs, v_refunds, v_chargebacks, v_adjustments
  from public.transactions
  where project_id = p_project_id and status = 'confirmed';

  v_net := greatest(v_gross - v_costs - v_refunds - v_chargebacks + v_adjustments, 0);
  v_raw_amount := round(v_net * v_agreement.participation_percentage / 100, 2);

  select * into v_previous from public.participations
  where project_id = p_project_id and investor_id = p_investor_id and status <> 'adjusted'
  order by created_at desc limit 1 for update;
  if found and v_previous.status = 'paid' then
    raise exception 'Paid participation cannot be recalculated; register an explicit adjustment';
  elsif found then
    update public.participations set status = 'adjusted' where id = v_previous.id;
  end if;

  select coalesce(sum(amount), 0) into v_accumulated
  from public.participations
  where agreement_id = v_agreement.id and investor_id = p_investor_id and status <> 'adjusted';
  v_final_amount := least(v_raw_amount, greatest(v_agreement.contractual_cap - v_accumulated, 0));

  perform set_config('app.audit_reason', p_reason, true);
  insert into public.participations(
    agreement_id, project_id, investor_id, gross_income, deductible_costs,
    refunds, chargebacks, adjustments, net_profit, percentage, amount, status, supersedes_id
  ) values (
    v_agreement.id, p_project_id, p_investor_id, v_gross, v_costs,
    v_refunds, v_chargebacks, v_adjustments, v_net,
    v_agreement.participation_percentage, v_final_amount, 'calculated', v_previous.id
  ) returning id into v_result;
  return v_result;
end $$;

revoke all on function public.calculate_project_participation(uuid, uuid, text) from public;
grant execute on function public.calculate_project_participation(uuid, uuid, text) to authenticated;

create or replace function public.storage_agreement_id(p_name text)
returns uuid language plpgsql immutable as $$
begin
  return split_part(p_name, '/', 1)::uuid;
exception when invalid_text_representation then return null;
end $$;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'agreement-documents', 'agreement-documents', false, 52428800,
  array['application/pdf','image/jpeg','image/png','image/webp','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "storage members read agreement documents" on storage.objects for select to authenticated
using (bucket_id = 'agreement-documents' and public.is_agreement_member(public.storage_agreement_id(name)));
create policy "storage admins upload agreement documents" on storage.objects for insert to authenticated
with check (bucket_id = 'agreement-documents' and public.is_agreement_admin(public.storage_agreement_id(name)) and owner_id = auth.uid()::text);
create policy "storage admins update agreement documents" on storage.objects for update to authenticated
using (bucket_id = 'agreement-documents' and public.is_agreement_admin(public.storage_agreement_id(name)))
with check (bucket_id = 'agreement-documents' and public.is_agreement_admin(public.storage_agreement_id(name)));
create policy "storage admins delete agreement documents" on storage.objects for delete to authenticated
using (bucket_id = 'agreement-documents' and public.is_agreement_admin(public.storage_agreement_id(name)));

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.updates;
