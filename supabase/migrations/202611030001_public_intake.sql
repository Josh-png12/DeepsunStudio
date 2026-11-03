-- DeepSun Studio — public intake: contact leads + moderated testimonials (tables, RLS, grants, anti-abuse, Storage).
--
-- WHY: the repository never created `leads` / `testimonials` nor the testimonial buckets (they were made by hand in the dashboard),
-- so their security could not be reviewed or reproduced. This file makes them reproducible and hardens them.
--
-- SAFETY PROPERTIES (each one is covered by tests/intake-db.test.ts):
--   * Single transaction: if anything fails nothing is applied (run the whole file in ONE execution).
--   * No existing row is modified or deleted. New columns have constant defaults. CHECK constraints are added NOT VALID, so old
--     rows that would violate them are left alone (VALIDATE them after cleaning).
--   * Schema-drift guard: aborts with a clear message if the existing tables have different or extra columns than the frontend uses.
--   * COMPATIBLE WITH THE CURRENTLY DEPLOYED FRONTEND: `select *` on testimonials, inserts with `approved:false`, and the old upload
--     names (any extension case) keep working, so this can be applied BEFORE deploying the new site.
--   * Replaces EVERY existing policy on both tables and on the testimonial buckets with default-deny policies.
--   * Anti-abuse is enforced in the database. The client address is read ONLY from the header configured in public.intake_settings
--     (default `cf-connecting-ip`, set by Cloudflare in front of Supabase). A value sent by the browser in X-Forwarded-For / X-Real-IP
--     is ignored. Counters only count rows that were actually stored, so invalid or rejected requests cannot burn anybody's quota.
-- RUN IT ON STAGING FIRST. Back up and read docs/PUBLICACION_SEGURA.md before production. Rollback: supabase/rollback/.

-- ───────────────────────────────────────────────────────────── helpers ──

create or replace function public._intake_ensure_check(p_table regclass, p_name text, p_expr text)
returns void language plpgsql as $$
begin
  if not exists (select 1 from pg_constraint where conname = p_name and conrelid = p_table) then
    execute format('alter table %s add constraint %I check (%s) not valid', p_table, p_name, p_expr);
  end if;
end $$;

-- ───────────────────────────────────────── schema-drift guard (existing tables) ──

do $$
declare v_bad text; v_extra text;
begin
  if to_regclass('public.leads') is not null then
    select string_agg(x.col || ' (expected ' || x.typ || ', found ' || coalesce(c.data_type, 'MISSING') || ')', '; ') into v_bad
    from (values ('id','uuid'),('created_at','timestamp with time zone'),('business_type','text'),('needs','ARRAY'),('budget','text'),
                 ('timeline','text'),('name','text'),('email','text'),('whatsapp','text'),('message','text')) as x(col, typ)
    left join information_schema.columns c on c.table_schema = 'public' and c.table_name = 'leads' and c.column_name = x.col
    where c.data_type is distinct from x.typ and not (x.typ = 'text' and c.data_type = 'character varying');
    if v_bad is not null then raise exception 'public.leads schema differs from what the frontend sends: %', v_bad; end if;
    select string_agg(column_name, ', ') into v_extra from information_schema.columns
    where table_schema = 'public' and table_name = 'leads'
      and column_name not in ('id','created_at','business_type','needs','budget','timeline','name','email','whatsapp','message','source','status','admin_notes','handled_by','handled_at');
    if v_extra is not null then raise exception 'public.leads has unexpected extra columns (%). Decide whether they are public-safe before applying: edit the column lists in this file.', v_extra; end if;
  end if;
  if to_regclass('public.testimonials') is not null then
    select string_agg(x.col || ' (expected ' || x.typ || ', found ' || coalesce(c.data_type, 'MISSING') || ')', '; ') into v_bad
    from (values ('id','uuid'),('created_at','timestamp with time zone'),('name','text'),('company','text'),('role','text'),('message','text'),
                 ('rating','integer'),('avatar_url','text'),('result_image_url','text'),('video_url','text'),('approved','boolean'),('featured','boolean')) as x(col, typ)
    left join information_schema.columns c on c.table_schema = 'public' and c.table_name = 'testimonials' and c.column_name = x.col
    where c.data_type is distinct from x.typ and not (x.typ = 'text' and c.data_type = 'character varying') and not (x.typ = 'integer' and c.data_type = 'smallint');
    if v_bad is not null then raise exception 'public.testimonials schema differs from what the frontend sends: %', v_bad; end if;
    select string_agg(column_name, ', ') into v_extra from information_schema.columns
    where table_schema = 'public' and table_name = 'testimonials'
      and column_name not in ('id','created_at','name','company','role','message','rating','avatar_url','result_image_url','video_url','approved','featured');
    if v_extra is not null then raise exception 'public.testimonials has unexpected extra columns (%). They would become publicly readable: decide before applying.', v_extra; end if;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────── tables ──

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_type text not null,
  needs text[] not null default '{}',
  budget text not null,
  timeline text not null,
  name text not null,
  email text not null,
  whatsapp text,
  message text
);

alter table public.leads
  add column if not exists source text not null default 'brief',
  add column if not exists status text not null default 'new',
  add column if not exists admin_notes text,
  add column if not exists handled_by uuid references auth.users(id) on delete set null,
  add column if not exists handled_at timestamptz;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  role text,
  message text not null,
  rating smallint not null,
  avatar_url text,
  result_image_url text,
  video_url text,
  approved boolean not null default false,
  featured boolean not null default false
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email, created_at desc);
create index if not exists testimonials_public_idx on public.testimonials (approved, featured desc, created_at desc);

-- Internal tables: never exposed through the API (RLS on, no policies, no grants). Only the SECURITY DEFINER guards below touch them.

create table if not exists public.intake_settings (key text primary key, value text not null);
insert into public.intake_settings (key, value) values
  ('trusted_ip_header', 'cf-connecting-ip'),   -- header injected by the platform edge; the browser cannot choose it
  ('xff_from_right', ''),                      -- empty = ignore X-Forwarded-For. N = take the Nth address from the right (only after verifying in staging)
  ('ip_pepper', md5(random()::text || clock_timestamp()::text || txid_current()::text)),   -- secret salt: stored hashes cannot be brute-forced back to IPs
  ('leads_per_ip_hour', '5'), ('leads_per_email_day', '3'), ('leads_global_hour', '500'),
  ('testimonials_per_ip_hour', '3'), ('testimonials_per_ip_day', '8'), ('testimonials_global_hour', '120'),
  ('log_retention_days', '14')
on conflict (key) do nothing;

create table if not exists public.intake_client_log (
  id bigint generated always as identity primary key,
  kind text not null,
  client_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists intake_client_log_idx on public.intake_client_log (kind, client_hash, created_at desc);

create table if not exists public.intake_moderation_log (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id uuid not null,
  action text not null,
  actor uuid,
  created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────── validation (CHECK, NOT VALID) ──

select public._intake_ensure_check('public.leads', 'leads_business_type_check', $c$business_type in ('hotel','salud','restaurante','consultorio','educacion','empresa','comercio','otro')$c$);
select public._intake_ensure_check('public.leads', 'leads_needs_check', $c$needs <@ array['sitio_nuevo','mejorar','whatsapp_bot','sistema','seo','asesoria']::text[] and cardinality(needs) between 1 and 6$c$);
select public._intake_ensure_check('public.leads', 'leads_budget_check', $c$budget in ('menos_500','500_1500','1500_3000','mas_3000','no_se')$c$);
select public._intake_ensure_check('public.leads', 'leads_timeline_check', $c$timeline in ('asap','mes','2_3_meses','explorando')$c$);
select public._intake_ensure_check('public.leads', 'leads_name_check', $c$length(btrim(name)) between 2 and 120$c$);
select public._intake_ensure_check('public.leads', 'leads_email_check', $c$length(email) <= 160 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'$c$);
select public._intake_ensure_check('public.leads', 'leads_whatsapp_check', $c$whatsapp is null or (length(whatsapp) <= 40 and whatsapp ~ '^[0-9+()\-\s.]{6,40}$')$c$);
select public._intake_ensure_check('public.leads', 'leads_message_check', $c$message is null or length(message) <= 2000$c$);
select public._intake_ensure_check('public.leads', 'leads_source_check', $c$source in ('brief','home_quick')$c$);
select public._intake_ensure_check('public.leads', 'leads_status_check', $c$status in ('new','contacted','qualified','won','lost','spam')$c$);

select public._intake_ensure_check('public.testimonials', 'testimonials_name_check', $c$length(btrim(name)) between 2 and 120$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_company_check', $c$company is null or length(company) <= 120$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_role_check', $c$role is null or length(role) <= 120$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_message_check', $c$length(btrim(message)) between 20 and 2000$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_rating_check', $c$rating between 1 and 5$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_avatar_url_check', $c$avatar_url is null or avatar_url ~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-avatars/[A-Za-z0-9._-]{1,120}$'$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_result_url_check', $c$result_image_url is null or result_image_url ~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-results/[A-Za-z0-9._-]{1,120}$'$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_video_url_check', $c$video_url is null or video_url ~ '^https?://[^/\s]+/storage/v1/object/public/testimonial-videos/[A-Za-z0-9._-]{1,120}$'$c$);
select public._intake_ensure_check('public.testimonials', 'testimonials_featured_requires_approved_check', $c$featured = false or approved = true$c$);

-- ──────────────────────────────────────────────────── server-side anti-abuse ──

create or replace function public.intake_setting_text(p_key text)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select value from public.intake_settings where key = p_key
$$;

create or replace function public.intake_setting_num(p_key text, p_default numeric)
returns numeric language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v text;
begin
  select value into v from public.intake_settings where key = p_key;
  return coalesce(nullif(v, '')::numeric, p_default);
exception when others then return p_default;
end $$;

-- The client address. Only the configured platform header is trusted; browser-supplied X-Forwarded-For / X-Real-IP are ignored
-- unless the owner explicitly sets `xff_from_right` after verifying how many proxies sit in front of the database in staging.
create or replace function public.intake_client_ip()
returns text language plpgsql stable security definer set search_path = public, pg_temp as $$
declare h json; ip text; hop int; parts text[];
begin
  begin h := nullif(current_setting('request.headers', true), '')::json; exception when others then return null; end;
  if h is null then return null; end if;
  ip := nullif(btrim(h ->> lower(coalesce(public.intake_setting_text('trusted_ip_header'), 'cf-connecting-ip'))), '');
  begin hop := nullif(public.intake_setting_text('xff_from_right'), '')::int; exception when others then hop := null; end;
  if ip is null and hop is not null and hop > 0 then
    parts := string_to_array(coalesce(h ->> 'x-forwarded-for', ''), ',');
    if coalesce(array_length(parts, 1), 0) >= hop then ip := nullif(btrim(parts[array_length(parts, 1) - hop + 1]), ''); end if;
  end if;
  if ip is not null and ip !~ '^[0-9a-fA-F:.]{3,45}$' then return null; end if;
  return ip;
end $$;

create or replace function public.intake_client_hash()
returns text language plpgsql stable security definer set search_path = public, pg_temp as $$
declare ip text := public.intake_client_ip();
begin
  if ip is null then return null; end if;
  return encode(sha256(convert_to(coalesce(public.intake_setting_text('ip_pepper'), '') || '|' || ip, 'UTF8')), 'hex');
end $$;

create or replace function public.intake_prune_logs()
returns void language sql security definer set search_path = public, pg_temp as $$
  delete from public.intake_client_log where created_at < now() - make_interval(days => greatest(1, public.intake_setting_num('log_retention_days', 14)::int))
$$;

create or replace function public.leads_intake_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_hash text := public.intake_client_hash(); v_n bigint;
begin
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  new.whatsapp := nullif(btrim(coalesce(new.whatsapp, '')), '');
  new.message := nullif(btrim(coalesce(new.message, '')), '');
  new.status := 'new'; new.handled_by := null; new.handled_at := null; new.admin_notes := null;
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;

  if exists (select 1 from public.leads l where l.email = new.email and l.business_type = new.business_type and l.budget = new.budget
             and l.timeline = new.timeline and l.needs = new.needs and coalesce(l.message, '') = coalesce(new.message, '')
             and l.created_at > now() - interval '24 hours') then
    raise exception 'duplicate_lead' using errcode = 'DS001';
  end if;
  if v_hash is not null then
    select count(*) into v_n from public.intake_client_log where kind = 'lead' and client_hash = v_hash and created_at > now() - interval '1 hour';
    if v_n >= public.intake_setting_num('leads_per_ip_hour', 5) then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  end if;
  select count(*) into v_n from public.leads where email = new.email and created_at > now() - interval '24 hours';
  if v_n >= public.intake_setting_num('leads_per_email_day', 3) then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  select count(*) into v_n from public.leads where created_at > now() - interval '1 hour';
  if v_n >= public.intake_setting_num('leads_global_hour', 500) then raise exception 'intake_paused' using errcode = 'DS003'; end if;

  -- Logged only now, inside the same statement: if the INSERT later fails (e.g. a CHECK), this row is rolled back too.
  if v_hash is not null then insert into public.intake_client_log (kind, client_hash) values ('lead', v_hash); end if;
  if random() < 0.01 then perform public.intake_prune_logs(); end if;
  return new;
end $$;

drop trigger if exists leads_intake_guard on public.leads;
create trigger leads_intake_guard before insert on public.leads for each row execute function public.leads_intake_guard();

create or replace function public.testimonials_intake_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_hash text := public.intake_client_hash(); v_n bigint;
begin
  new.name := btrim(new.name);
  new.message := btrim(new.message);
  new.company := nullif(btrim(coalesce(new.company, '')), '');
  new.role := nullif(btrim(coalesce(new.role, '')), '');
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  -- Nobody can publish or feature their own submission, whatever the request contains.
  new.approved := false; new.featured := false;

  if exists (select 1 from public.testimonials t where t.name = new.name and t.message = new.message and t.created_at > now() - interval '24 hours') then
    raise exception 'duplicate_testimonial' using errcode = 'DS001';
  end if;
  if v_hash is not null then
    select count(*) into v_n from public.intake_client_log where kind = 'testimonial' and client_hash = v_hash and created_at > now() - interval '1 hour';
    if v_n >= public.intake_setting_num('testimonials_per_ip_hour', 3) then raise exception 'rate_limited' using errcode = 'DS002'; end if;
    select count(*) into v_n from public.intake_client_log where kind = 'testimonial' and client_hash = v_hash and created_at > now() - interval '24 hours';
    if v_n >= public.intake_setting_num('testimonials_per_ip_day', 8) then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  end if;
  select count(*) into v_n from public.testimonials where created_at > now() - interval '1 hour';
  if v_n >= public.intake_setting_num('testimonials_global_hour', 120) then raise exception 'intake_paused' using errcode = 'DS003'; end if;

  if v_hash is not null then insert into public.intake_client_log (kind, client_hash) values ('testimonial', v_hash); end if;
  return new;
end $$;

drop trigger if exists testimonials_intake_guard on public.testimonials;
create trigger testimonials_intake_guard before insert on public.testimonials for each row execute function public.testimonials_intake_guard();

-- Moderation: only a platform admin (or a trusted internal connection) may change approved/featured; content can never be edited afterwards.
-- "Trusted" = no API role claim (Supabase dashboard / SQL editor / direct postgres) or service_role. API requests are always 'anon' or 'authenticated'.
create or replace function public.testimonials_moderation_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  if new.featured and not new.approved then new.featured := false; end if;
  if new.approved is distinct from old.approved or new.featured is distinct from old.featured then
    if not public.is_platform_admin() then raise exception 'moderation_not_allowed' using errcode = '42501'; end if;
    if new.approved is distinct from old.approved then
      insert into public.intake_moderation_log (entity, entity_id, action, actor) values ('testimonial', old.id, case when new.approved then 'approve' else 'unapprove' end, auth.uid());
    end if;
    if new.featured is distinct from old.featured then
      insert into public.intake_moderation_log (entity, entity_id, action, actor) values ('testimonial', old.id, case when new.featured then 'feature' else 'unfeature' end, auth.uid());
    end if;
  end if;
  new.name := old.name; new.company := old.company; new.role := old.role; new.message := old.message; new.rating := old.rating;
  new.avatar_url := old.avatar_url; new.result_image_url := old.result_image_url; new.video_url := old.video_url;
  return new;
end $$;

drop trigger if exists testimonials_moderation_guard on public.testimonials;
create trigger testimonials_moderation_guard before update on public.testimonials for each row execute function public.testimonials_moderation_guard();

-- Lead handling by admins: stamp who/when; content stays immutable.
create or replace function public.leads_handling_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  if not public.is_platform_admin() then raise exception 'not_allowed' using errcode = '42501'; end if;
  if new.status is distinct from old.status then new.handled_by := auth.uid(); new.handled_at := now(); end if;
  new.business_type := old.business_type; new.needs := old.needs; new.budget := old.budget; new.timeline := old.timeline;
  new.name := old.name; new.email := old.email; new.whatsapp := old.whatsapp; new.message := old.message; new.source := old.source;
  return new;
end $$;

drop trigger if exists leads_handling_guard on public.leads;
create trigger leads_handling_guard before update on public.leads for each row execute function public.leads_handling_guard();

-- Helper/guard functions are PostgREST-callable by default (EXECUTE is granted to PUBLIC): close that.
revoke all on function public.intake_setting_text(text) from public, anon, authenticated;
revoke all on function public.intake_setting_num(text, numeric) from public, anon, authenticated;
revoke all on function public.intake_client_ip() from public, anon, authenticated;
revoke all on function public.intake_client_hash() from public, anon, authenticated;
revoke all on function public.intake_prune_logs() from public, anon, authenticated;
revoke all on function public.leads_intake_guard() from public, anon, authenticated;
revoke all on function public.testimonials_intake_guard() from public, anon, authenticated;
revoke all on function public.testimonials_moderation_guard() from public, anon, authenticated;
revoke all on function public.leads_handling_guard() from public, anon, authenticated;
revoke all on function public._intake_ensure_check(regclass, text, text) from public, anon, authenticated;

-- ──────────────────────────────────────────────────────────── RLS + grants ──

do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('leads', 'testimonials', 'intake_moderation_log') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.leads enable row level security;
alter table public.testimonials enable row level security;
alter table public.intake_settings enable row level security;
alter table public.intake_client_log enable row level security;
alter table public.intake_moderation_log enable row level security;

revoke all on public.leads from public, anon, authenticated;
revoke all on public.testimonials from public, anon, authenticated;
revoke all on public.intake_settings from public, anon, authenticated;
revoke all on public.intake_client_log from public, anon, authenticated;
revoke all on public.intake_moderation_log from public, anon, authenticated;

-- leads: anyone may submit; only platform admins may read / triage / delete.
grant insert (business_type, needs, budget, timeline, name, email, whatsapp, message, source) on public.leads to anon, authenticated;
grant select on public.leads to authenticated;                       -- rows are filtered by the admin-only policy below
grant update (status, admin_notes) on public.leads to authenticated;
grant delete on public.leads to authenticated;

create policy "leads public insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads admin select" on public.leads for select to authenticated using (public.is_platform_admin());
create policy "leads admin update" on public.leads for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "leads admin delete" on public.leads for delete to authenticated using (public.is_platform_admin());

-- testimonials: anyone may submit (always unapproved); the public sees only approved rows; admins moderate.
-- Every column of the table is public-safe (it holds no internal data), so `select *` from the currently deployed site keeps working.
grant insert (name, company, role, message, rating, avatar_url, result_image_url, video_url, approved) on public.testimonials to anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant update (approved, featured) on public.testimonials to authenticated;
grant delete on public.testimonials to authenticated;

create policy "testimonials public insert unapproved" on public.testimonials for insert to anon, authenticated with check (approved = false and featured = false);
create policy "testimonials public read approved" on public.testimonials for select to anon, authenticated using (approved = true);
create policy "testimonials admin read all" on public.testimonials for select to authenticated using (public.is_platform_admin());
create policy "testimonials admin update" on public.testimonials for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "testimonials admin delete" on public.testimonials for delete to authenticated using (public.is_platform_admin());

grant select on public.intake_moderation_log to authenticated;
create policy "moderation log admin read" on public.intake_moderation_log for select to authenticated using (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────────── Storage ──
-- Public-read buckets (images/videos are shown on the site once a testimonial is approved). Size and MIME limits are enforced by
-- Storage itself. Uploads are anonymous but restricted by bucket and file-name pattern (any extension case, as the deployed site
-- uploads); nothing can be listed, overwritten or deleted by the public. LIMITATION: the MIME type is the one declared by the client;
-- unapproved files are reachable by whoever knows the random URL; orphan files (uploads without a testimonial) need periodic cleanup.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('testimonial-avatars', 'testimonial-avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('testimonial-results', 'testimonial-results', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('testimonial-videos', 'testimonial-videos', true, 52428800, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
           and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~ 'testimonial-(avatars|results|videos)' loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "intake upload testimonial files" on storage.objects for insert to anon, authenticated with check (
  (bucket_id in ('testimonial-avatars', 'testimonial-results') and name ~* '^[0-9]{10,14}-[a-z0-9]{4,24}\.(png|jpe?g|webp)$')
  or (bucket_id = 'testimonial-videos' and name ~* '^[0-9]{10,14}-[a-z0-9]{4,24}\.(mp4|mov|webm)$')
);
create policy "intake admin manage testimonial files" on storage.objects for all to authenticated
  using (bucket_id in ('testimonial-avatars', 'testimonial-results', 'testimonial-videos') and public.is_platform_admin())
  with check (bucket_id in ('testimonial-avatars', 'testimonial-results', 'testimonial-videos') and public.is_platform_admin());

drop function public._intake_ensure_check(regclass, text, text);
