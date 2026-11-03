-- DeepSun Studio — least-privilege hardening of the portal (functions, table privileges, cross-agreement integrity).
--
-- WHY (all verified read-only against the real project, see docs/AUDITORIA_PRODUCCION.md):
--   * Supabase's default privileges grant EXECUTE on every new public function to anon / authenticated / service_role. 202609290002 only
--     did `revoke ... from public`, which does NOT remove those explicit grants, so in production anon could call is_platform_admin(),
--     is_agreement_admin(), is_agreement_member(), project_accepts_financials() and calculate_project_participation() through /rpc.
--     The first three take an arbitrary user id: they were a membership / role oracle ("is this UUID an admin?").
--   * The API roles hold TRUNCATE, REFERENCES, TRIGGER and MAINTAIN on every table. RLS does not protect TRUNCATE. PostgREST does not
--     expose it, so it is not exploitable through the API today, but it is one wrong feature away from being so.
--   * anon holds ALL privileges on the 19 portal tables while having no policy on them: RLS alone was the only barrier.
--   * transactions / documents / participations accept a project_id from ANOTHER agreement (plain foreign key). An admin of agreement A
--     who knows a project UUID of agreement B could write confirmed ledger rows into B's project; calculate_project_participation()
--     sums by project_id and would include them.
--
-- WHAT IT DOES NOT BREAK (each one is covered by tests/hardening-db.test.ts):
--   * RLS policies call the helpers as the invoking role, so `authenticated` KEEPS execute on exactly the helpers the policies use.
--   * Trigger functions need no EXECUTE privilege to fire (Postgres checks it only at CREATE TRIGGER time).
--   * The portal uses calculate_project_participation through supabase.rpc as an authenticated admin: kept for authenticated.
--   * Service role / dashboard / SQL editor (auth.role() is null or service_role) can still call the helpers with any user id.
--
-- NOT TOUCHED ON PURPOSE: the intake tables and functions of 202611030001 (they already carry their own explicit grants), default
-- privileges for future tables (owned by supabase_admin / postgres, changing them affects every future table), Storage, Auth.
-- Idempotent. Run in ONE execution, on staging first. Rollback: supabase/rollback/202611030003_harden_privileges_rollback.sql

begin;

-- ───────────────────────────────────────────── 1. helpers: no arbitrary-user oracle ──
-- An API caller (anon / authenticated) can only ask about THEMSELVES. Policies and triggers always ask about auth.uid(), so their
-- behaviour is unchanged. Internal callers (service_role, dashboard, SQL editor: auth.role() is null) may ask about anyone.

create or replace function public.is_platform_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select p_user_id is not null
    and (p_user_id = auth.uid() or coalesce(auth.role(), 'service_role') = 'service_role')
    and exists(select 1 from public.profiles where id = p_user_id and role = 'admin')
$$;

create or replace function public.is_agreement_member(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select p_user_id is not null
    and (p_user_id = auth.uid() or coalesce(auth.role(), 'service_role') = 'service_role')
    and exists(select 1 from public.agreement_members where agreement_id = p_agreement_id and user_id = p_user_id)
$$;

create or replace function public.is_agreement_admin(p_agreement_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select p_user_id is not null
    and (p_user_id = auth.uid() or coalesce(auth.role(), 'service_role') = 'service_role')
    and (
      public.is_platform_admin(p_user_id) or exists(
        select 1 from public.agreement_members
        where agreement_id = p_agreement_id and user_id = p_user_id and role = 'admin'
      )
    )
$$;

-- ─────────────────────────────────────────────────────────────── 2. EXECUTE privileges ──
-- Helpers used by RLS: authenticated only (anon has no policy that calls them).
revoke all on function public.is_platform_admin(uuid) from public, anon;
revoke all on function public.is_agreement_member(uuid, uuid) from public, anon;
revoke all on function public.is_agreement_admin(uuid, uuid) from public, anon;
revoke all on function public.project_accepts_financials(uuid) from public, anon;
revoke all on function public.storage_agreement_id(text) from public, anon;
grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.is_agreement_member(uuid, uuid) to authenticated;
grant execute on function public.is_agreement_admin(uuid, uuid) to authenticated;
grant execute on function public.project_accepts_financials(uuid) to authenticated;
grant execute on function public.storage_agreement_id(text) to authenticated;

-- RPC used by the portal (admins only, enforced inside the function): authenticated only.
revoke all on function public.calculate_project_participation(uuid, uuid, text) from public, anon;
grant execute on function public.calculate_project_participation(uuid, uuid, text) to authenticated;

-- Trigger functions are never called directly: nobody on the API needs EXECUTE. (service_role keeps its default grant.)
revoke all on function public.apply_project_update_snapshot() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.notify_project_event() from public, anon, authenticated;
revoke all on function public.protect_confirmed_transaction() from public, anon, authenticated;
revoke all on function public.protect_opportunity_finances() from public, anon, authenticated;
revoke all on function public.protect_profile_role() from public, anon, authenticated;
revoke all on function public.protect_project_financial_phase() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.sync_project_tracking_agreement() from public, anon, authenticated;
revoke all on function public.write_audit_log() from public, anon, authenticated;

-- ──────────────────────────────────────────────────────────────── 3. table privileges ──
-- anon never had a policy on the portal tables: remove the (useless, and dangerous if a policy is ever added by mistake) privileges.
-- Explicit list on purpose: the intake tables created by 202611030001 grant anon exactly what the public forms need.
revoke all on
  public.profiles, public.agreements, public.agreement_members, public.projects, public.documents, public.transactions,
  public.participations, public.payments, public.updates, public.audit_logs, public.notifications, public.user_preferences,
  public.personal_expenses, public.savings_goals, public.reminders, public.project_internal_details, public.project_updates,
  public.project_milestones, public.project_blockers
from anon;

-- Row-level security does not apply to these four: nobody on the API needs them, on any table of the schema.
revoke truncate, references, trigger, maintain on all tables in schema public from anon, authenticated;

-- Append-only / trigger-written tables: the API only reads them (notifications: and updates its own read state).
revoke insert, update, delete on public.audit_logs from authenticated;
revoke insert, delete on public.notifications from authenticated;

-- ─────────────────────────────────────────── 4. a project must belong to the row's agreement ──
create or replace function public.enforce_project_same_agreement()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p where p.id = new.project_id and p.agreement_id = new.agreement_id
  ) then
    raise exception 'project_agreement_mismatch: the project does not belong to the agreement of this row' using errcode = '23514';
  end if;
  return new;
end $$;
revoke all on function public.enforce_project_same_agreement() from public, anon, authenticated;

drop trigger if exists enforce_project_same_agreement_transactions on public.transactions;
create trigger enforce_project_same_agreement_transactions before insert or update of project_id, agreement_id on public.transactions
  for each row execute function public.enforce_project_same_agreement();
drop trigger if exists enforce_project_same_agreement_documents on public.documents;
create trigger enforce_project_same_agreement_documents before insert or update of project_id, agreement_id on public.documents
  for each row execute function public.enforce_project_same_agreement();
drop trigger if exists enforce_project_same_agreement_participations on public.participations;
create trigger enforce_project_same_agreement_participations before insert or update of project_id, agreement_id on public.participations
  for each row execute function public.enforce_project_same_agreement();

commit;
