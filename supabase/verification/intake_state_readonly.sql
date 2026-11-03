-- DeepSun Studio — READ-ONLY inspection of the real intake setup (leads / testimonials / buckets).
-- Safe to run in the Supabase SQL editor of STAGING or PRODUCTION: it only SELECTs from catalogs. It changes nothing.
-- Purpose: learn what is deployed today BEFORE applying 202611030001_public_intake.sql, and re-run it afterwards to confirm the result.
-- Paste each block's result into the report. Expected "after migration" values are in the comments.

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

-- 4) Privileges held by the API roles. DANGER: anon with SELECT/UPDATE/DELETE on leads, or UPDATE on testimonials.
select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('leads', 'testimonials') and grantee in ('anon', 'authenticated', 'public')
order by table_name, grantee, privilege_type;

-- 5) Column-level privileges (after migration anon may INSERT only the form columns and SELECT only public testimonial columns)
select table_name, grantee, privilege_type, string_agg(column_name, ', ' order by column_name) as columns
from information_schema.column_privileges
where table_schema = 'public' and table_name in ('leads', 'testimonials') and grantee in ('anon', 'authenticated')
group by table_name, grantee, privilege_type order by 1, 2, 3;

-- 6) Triggers (after migration: *_intake_guard before insert, testimonials_moderation_guard / leads_handling_guard before update)
select event_object_table as table_name, trigger_name, action_timing, event_manipulation
from information_schema.triggers where event_object_schema = 'public' and event_object_table in ('leads', 'testimonials') order by 1, 2;

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
