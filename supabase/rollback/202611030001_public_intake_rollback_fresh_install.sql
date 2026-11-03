-- Complete rollback of 202611030001_public_intake.sql for a project where the migration CREATED leads / testimonials (this is the case of
-- the production project audited on 2026-11-03: neither table nor the testimonial buckets existed before). Use it instead of
-- 202611030001_public_intake_rollback.sql, which only removes the machinery and keeps the tables. NOT run automatically.
--
-- ORDER when 003 is also applied:  202611030003_harden_privileges_rollback.sql  →  this file  →  Storage buckets (step 2 below).
-- (003 does not depend on 001, so it can also stay applied; only the order above is required if you revert both.)
--
-- SAFETY: it REFUSES to run if leads or testimonials contain any row (personal data and the owner's moderation work). Export them first
-- (CSV kept OUTSIDE the repository), or use the other rollback file, which keeps the rows. Everything happens in ONE transaction.
--
-- STEP 2 — Storage buckets cannot be removed from SQL: Supabase installs triggers (storage.protect_delete) that block DELETE on
-- storage.buckets and storage.objects. Remove the files and the buckets with the Storage API (service role, staging/production
-- dashboard → Storage → bucket → ⋯ → Delete bucket, or):
--   const s = createClient(URL, SERVICE_ROLE_KEY).storage
--   for (const b of ['testimonial-avatars', 'testimonial-results', 'testimonial-videos']) { await s.emptyBucket(b); await s.deleteBucket(b) }
-- Do it only after confirming nobody still needs those files. This file leaves the buckets in place (their upload policy IS removed,
-- so the public can no longer write to them).

begin;

do $$
begin
  if to_regclass('public.leads') is not null and exists (select 1 from public.leads) then
    raise exception 'public.leads still holds rows: export them first, or use 202611030001_public_intake_rollback.sql (keeps the data)';
  end if;
  if to_regclass('public.testimonials') is not null and exists (select 1 from public.testimonials) then
    raise exception 'public.testimonials still holds rows: export them first, or use 202611030001_public_intake_rollback.sql (keeps the data)';
  end if;
end $$;

-- Storage policies created by the migration (the public can no longer upload; admins lose the manage-all policy on those buckets).
drop policy if exists "intake upload testimonial files" on storage.objects;
drop policy if exists "intake admin manage testimonial files" on storage.objects;

-- Triggers, guard functions and internal tables.
drop trigger if exists leads_intake_guard on public.leads;
drop trigger if exists leads_handling_guard on public.leads;
drop trigger if exists testimonials_intake_guard on public.testimonials;
drop trigger if exists testimonials_moderation_guard on public.testimonials;

drop function if exists public.leads_intake_guard();
drop function if exists public.leads_handling_guard();
drop function if exists public.testimonials_intake_guard();
drop function if exists public.testimonials_moderation_guard();
drop function if exists public.intake_prune_logs();
drop function if exists public.intake_client_hash();
drop function if exists public.intake_client_ip();
drop function if exists public.intake_setting_num(text, numeric);
drop function if exists public.intake_setting_text(text);

drop table if exists public.intake_client_log;
drop table if exists public.intake_moderation_log;
drop table if exists public.intake_settings;

-- The tables themselves (policies, indexes and CHECK constraints go with them).
drop table if exists public.leads;
drop table if exists public.testimonials;

commit;

-- Remaining after this file (read-only check): the three buckets, until step 2 is done.
select id, public from storage.buckets where id like 'testimonial-%';
