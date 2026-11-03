-- DeepSun Studio — READ-ONLY inspection of the real intake setup (leads / testimonials / buckets).
-- Every statement is a plain SELECT over system catalogs, or a COUNT/MIN/MAX over our two tables. It changes nothing and returns
-- no personal data (no names, emails, phones, messages or URLs are ever selected). tests/readonly-sql.test.ts enforces this.
--
-- HOW TO RUN (full guide: docs/SQL_LECTURA_PRODUCCION.md):
--   * Supabase Dashboard → SQL Editor → New query. Paste ONE numbered block at a time and run it ("Run" on the selection).
--   * Optional extra guarantee: wrap a block as  BEGIN READ ONLY;  <block>  ROLLBACK;  — Postgres then refuses any write.
--   * If block 1 shows that a table does not exist, skip the blocks that mention it (they would just error).
-- Expected "after migration" values are in the comments.

-- 0) Session sanity (expected: transaction_read_only = on when you used BEGIN READ ONLY)
select current_user as running_as, current_setting('transaction_read_only') as transaction_read_only, current_setting('server_version') as postgres_version;

-- 1) Do the tables exist, and is Row Level Security ON? (expected after: both rows, rls_enabled = true)
select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c where c.relnamespace = 'public'::regnamespace and c.relname in ('leads', 'testimonials');

-- 2) Columns and types (compare with the frontend payload: docs/PRUEBAS_STAGING_SUPABASE.md)
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema = 'public' and table_name in ('leads', 'testimonials') order by table_name, ordinal_position;

-- 3) Existing policies. DANGER signs: roles containing public/anon with cmd ALL or UPDATE/DELETE/SELECT on leads,
--    or UPDATE on testimonials for anon, or a SELECT policy on testimonials without "approved".
--    (expected after: leads → insert for anon/authenticated + admin select/update/delete; testimonials → see migration)
select tablename, policyname, cmd, roles, qual, with_check from pg_policies
where schemaname = 'public' and tablename in ('leads', 'testimonials') order by tablename, cmd, policyname;

-- 4) Table privileges ACTUALLY held by the API roles, computed with has_table_privilege() — which sees real ACLs including inherited and
--    default ones. (information_schema.role_table_grants shows only grants visible to the CURRENT role: run by a non-owner it returns an
--    empty list that looks "safe" and is not. That is how the audit first under-reported.)
--    DANGER: anon with select/update/delete on leads, or update on testimonials. Expected after: anon → insert on leads, select on testimonials.
select c.relname as table_name, r.grantee, string_agg(p.priv, ', ' order by p.priv) as privileges
from pg_class c
cross join (values ('anon'), ('authenticated')) as r(grantee)
cross join (values ('select'), ('insert'), ('update'), ('delete'), ('truncate'), ('references'), ('trigger')) as p(priv)
where c.relnamespace = 'public'::regnamespace and c.relname in ('leads', 'testimonials') and has_table_privilege(r.grantee, c.oid, p.priv)
group by c.relname, r.grantee order by 1, 2;

-- 5) Column-level privileges (after migration anon may INSERT only the form columns and SELECT testimonials, filtered by RLS to approved rows)
select c.relname as table_name, r.grantee, p.priv as privilege_type, string_agg(a.attname, ', ' order by a.attname) as columns
from pg_class c
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
cross join (values ('anon'), ('authenticated')) as r(grantee)
cross join (values ('select'), ('insert'), ('update')) as p(priv)
where c.relnamespace = 'public'::regnamespace and c.relname in ('leads', 'testimonials') and has_column_privilege(r.grantee, c.oid, a.attnum, p.priv)
group by c.relname, r.grantee, p.priv order by 1, 2, 3;

-- 6) Triggers from the system catalog (information_schema.triggers is also filtered by the current role's privileges).
--    After migration: *_intake_guard before insert, testimonials_moderation_guard / leads_handling_guard before update.
select c.relname as table_name, t.tgname as trigger_name, pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
where not t.tgisinternal and c.relnamespace = 'public'::regnamespace and c.relname in ('leads', 'testimonials') order by 1, 2;

-- 7) Buckets: public flag, size limit and MIME types (expected after: 2 MB / 5 MB / 50 MB and the listed MIME types)
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id like 'testimonial-%' or id = 'agreement-documents';

-- 8) Storage policies touching those buckets
select policyname, cmd, roles, qual, with_check from pg_policies
where schemaname = 'storage' and tablename = 'objects' order by policyname;

-- 9) Volume and hygiene (counts only — no personal data is selected)
select 'leads' as t, count(*) as rows, min(created_at) as first, max(created_at) as last from public.leads
union all select 'testimonials', count(*), min(created_at), max(created_at) from public.testimonials;
select approved, featured, count(*) from public.testimonials group by 1, 2;

-- 10) Rows that would violate the new CHECK constraints (run before VALIDATE CONSTRAINT; each should return 0)
select 'leads bad email' as problem, count(*) from public.leads where email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
union all select 'leads unknown business_type', count(*) from public.leads where business_type not in ('hotel','salud','restaurante','consultorio','educacion','empresa','comercio','otro')
union all select 'testimonials rating out of range', count(*) from public.testimonials where rating not between 1 and 5
union all select 'testimonials external media url', count(*) from public.testimonials
  where (avatar_url is not null and avatar_url !~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-avatars/')
     or (result_image_url is not null and result_image_url !~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-results/')
     or (video_url is not null and video_url !~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-videos/');

-- 11) Portal hardening (migration 202611030003). How many public tables each API role can TRUNCATE / REFERENCE / TRIGGER, and how many
--     it can read or write at all. DANGER before 003: anon and authenticated hold truncate/references/trigger on every table and anon
--     holds select/insert/update/delete on the portal tables. Expected after 003: truncate/references/trigger = 0 for both roles;
--     anon only has what the public forms need: select on testimonials (1 table here; its INSERT on leads/testimonials is column-level, see block 5).
select r.grantee, p.priv as privilege, count(*) as tables_with_privilege
from pg_class c
cross join (values ('anon'), ('authenticated')) as r(grantee)
cross join (values ('select'), ('insert'), ('update'), ('delete'), ('truncate'), ('references'), ('trigger')) as p(priv)
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and has_table_privilege(r.grantee, c.oid, p.priv)
group by r.grantee, p.priv order by 1, 2;

-- 12) Who can EXECUTE each function of the public schema (RPC surface). DANGER before 003: anon_exec = true on is_platform_admin,
--     is_agreement_admin, is_agreement_member, project_accepts_financials, calculate_project_participation.
--     Expected after: anon_exec = false everywhere; authenticated_exec = true ONLY for those five helpers/RPCs and storage_agreement_id.
select p.proname as function_name, pg_get_function_identity_arguments(p.oid) as arguments, p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'execute') as anon_exec, has_function_privilege('authenticated', p.oid, 'execute') as authenticated_exec
from pg_proc p where p.pronamespace = 'public'::regnamespace order by 1, 2;

-- 13) Storage read policy for private documents. Read the "qual" text. DEFECT (before 002): it contains  d.storage_path = d.name  — the
--     subquery is not tied to the object. Expected after 002: it references  objects.name  together with  storage_agreement_id(objects.name)
--     and the project visibility check.
select policyname, cmd, roles, qual from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like '%read agreement documents%' order by policyname;
