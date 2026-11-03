-- Rollback of 202611030001_public_intake.sql — NOT run automatically. Read docs/PUBLICACION_SEGURA.md first.
--
-- What it does: removes the anti-abuse/moderation machinery and the private log tables, and stops the new policies from blocking the site.
-- What it deliberately does NOT do:
--   * delete leads/testimonials rows, nor the columns the migration added (status, admin_notes, source, handled_*): dropping them loses triage work;
--   * recreate the OLD policies, because they were hand-made and unknown: restore them from the snapshot you saved in step 2 of the
--     deploy plan (results of blocks 3/4/8 of supabase/verification/intake_state_readonly.sql) or from the project backup.
-- After this file the tables keep RLS ON with the NEW policies (safe default). To fully revert behaviour, re-create the old policies from your snapshot.
-- Run in ONE execution, in staging first.

begin;

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

-- Optional (only if you want the old, unvalidated behaviour back for bad data): drop the CHECK constraints.
-- alter table public.leads drop constraint if exists leads_business_type_check, drop constraint if exists leads_needs_check, ...;

commit;

-- EMERGENCY SWITCHES (no rollback needed) ---------------------------------------------------------------------------------
-- Pause new leads immediately (visitors see the "intake paused" message and can use WhatsApp):
--   update public.intake_settings set value = '0' where key = 'leads_global_hour';
-- Resume:
--   update public.intake_settings set value = '500' where key = 'leads_global_hour';
-- A legitimate visitor is blocked by the per-address limit (shared office / mobile carrier network): raise or clear it:
--   update public.intake_settings set value = '20' where key = 'leads_per_ip_hour';
--   delete from public.intake_client_log where created_at > now() - interval '1 hour';
