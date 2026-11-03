-- Rollback of 202611030003_harden_privileges.sql — NOT run automatically. Only for the case where the hardening breaks something that
-- staging did not catch. It puts the privileges back exactly as the audit found them in production (which is the LESS safe state:
-- anon can call the helper RPCs and the API roles hold TRUNCATE & co.). Prefer fixing forward: re-grant ONE function / table to
-- `authenticated` instead of running this whole file. Run in ONE execution.

begin;

-- 4. integrity triggers
drop trigger if exists enforce_project_same_agreement_transactions on public.transactions;
drop trigger if exists enforce_project_same_agreement_documents on public.documents;
drop trigger if exists enforce_project_same_agreement_participations on public.participations;
drop function if exists public.enforce_project_same_agreement();

-- 3. table privileges (as found in production)
grant all on
  public.profiles, public.agreements, public.agreement_members, public.projects, public.documents, public.transactions,
  public.participations, public.payments, public.updates, public.audit_logs, public.notifications, public.user_preferences,
  public.personal_expenses, public.savings_goals, public.reminders, public.project_internal_details, public.project_updates,
  public.project_milestones, public.project_blockers
to anon;
grant truncate, references, trigger, maintain on
  public.profiles, public.agreements, public.agreement_members, public.projects, public.documents, public.transactions,
  public.participations, public.payments, public.updates, public.audit_logs, public.notifications, public.user_preferences,
  public.personal_expenses, public.savings_goals, public.reminders, public.project_internal_details, public.project_updates,
  public.project_milestones, public.project_blockers
to authenticated;
grant insert, update, delete on public.audit_logs to authenticated;
grant insert, delete on public.notifications to authenticated;

-- 2. EXECUTE privileges (as found in production: Supabase default privileges)
grant execute on function public.is_platform_admin(uuid), public.is_agreement_member(uuid, uuid), public.is_agreement_admin(uuid, uuid),
  public.project_accepts_financials(uuid), public.storage_agreement_id(text), public.calculate_project_participation(uuid, uuid, text)
  to anon, authenticated;
grant execute on function public.apply_project_update_snapshot(), public.handle_new_auth_user(), public.notify_project_event(),
  public.protect_confirmed_transaction(), public.protect_opportunity_finances(), public.protect_profile_role(),
  public.protect_project_financial_phase(), public.set_updated_at(), public.sync_project_tracking_agreement(), public.write_audit_log()
  to public, anon, authenticated;

-- 1. helper bodies (original definitions from 202609290002)
create or replace function public.is_platform_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.profiles where id = p_user_id and role = 'admin')
$$;
create or replace function public.is_agreement_member(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.agreement_members where agreement_id = p_agreement_id and user_id = p_user_id)
$$;
create or replace function public.is_agreement_admin(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.is_platform_admin(p_user_id) or exists(
    select 1 from public.agreement_members
    where agreement_id = p_agreement_id and user_id = p_user_id and role = 'admin'
  )
$$;

commit;
