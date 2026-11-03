-- DeepSun Studio — public intake: contact leads + moderated testimonials (tables, RLS, grants, anti-abuse, Storage).
--
-- Why this migration exists: the repository never created `leads` / `testimonials` nor the testimonial buckets (they were made by hand
-- in the dashboard), so their security could not be reviewed or reproduced. This file makes them reproducible and hardens them.
--
-- Safe to run on a project where the tables already exist:
--   * a schema-drift guard aborts with a clear message if existing columns do not match what the frontend sends;
--   * CHECK constraints are added NOT VALID (enforced for new rows; old rows are not rejected — VALIDATE them after cleaning data);
--   * every pre-existing policy on both tables and on the testimonial buckets is dropped and recreated (default-deny).
-- RUN IT ON STAGING FIRST. Never against production without reading docs/PRUEBAS_STAGING_SUPABASE.md.

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
declare v_bad text;
begin
  if to_regclass('public.leads') is not null then
    select string_agg(x.col || ' (expected ' || x.typ || ', found ' || coalesce(c.data_type, 'MISSING') || ')', '; ') into v_bad
    from (values ('id','uuid'),('created_at','timestamp with time zone'),('business_type','text'),('needs','ARRAY'),('budget','text'),
                 ('timeline','text'),('name','text'),('email','text'),('whatsapp','text'),('message','text')) as x(col, typ)
    left join information_schema.columns c on c.table_schema = 'public' and c.table_name = 'leads' and c.column_name = x.col
    where c.data_type is distinct from x.typ and not (x.typ = 'text' and c.data_type = 'character varying');
    if v_bad is not null then raise exception 'public.leads schema differs from what the frontend sends: %', v_bad; end if;
  end if;
  if to_regclass('public.testimonials') is not null then
    select string_agg(x.col || ' (expected ' || x.typ || ', found ' || coalesce(c.data_type, 'MISSING') || ')', '; ') into v_bad
    from (values ('id','uuid'),('created_at','timestamp with time zone'),('name','text'),('company','text'),('role','text'),('message','text'),
                 ('rating','integer'),('avatar_url','text'),('result_image_url','text'),('video_url','text'),('approved','boolean'),('featured','boolean')) as x(col, typ)
    left join information_schema.columns c on c.table_schema = 'public' and c.table_name = 'testimonials' and c.column_name = x.col
    where c.data_type is distinct from x.typ and not (x.typ = 'text' and c.data_type = 'character varying') and not (x.typ = 'integer' and c.data_type = 'smallint');
    if v_bad is not null then raise exception 'public.testimonials schema differs from what the frontend sends: %', v_bad; end if;
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
  add column if not exists handled_at timestamptz,
  add column if not exists client_hash text;

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

alter table public.testimonials
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz,
  add column if not exists client_hash text;

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_client_idx on public.leads (client_hash, created_at desc);
create index if not exists leads_email_idx on public.leads (email, created_at desc);
create index if not exists testimonials_public_idx on public.testimonials (approved, featured desc, created_at desc);
create index if not exists testimonials_client_idx on public.testimonials (client_hash, created_at desc);

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
-- Applies to every client that reaches PostgREST, regardless of the frontend. Browser-side throttling is only a convenience.
-- The client address is read from the request headers PostgREST exposes; it is stored only as a salted SHA-256 hash.
-- LIMITATION: a distributed botnet is not stopped by per-address limits; the global breaker bounds the damage.
-- Add CAPTCHA (e.g. Cloudflare Turnstile verified server-side) if abuse is observed. Confirm in staging which header carries the real client IP.

create or replace function public.intake_client_ip()
returns text language plpgsql stable as $$
declare h json; ip text;
begin
  begin h := nullif(current_setting('request.headers', true), '')::json; exception when others then h := null; end;
  if h is null then return null; end if;
  ip := coalesce(nullif(h->>'cf-connecting-ip', ''), nullif(h->>'x-real-ip', ''), nullif(btrim(split_part(coalesce(h->>'x-forwarded-for', ''), ',', 1)), ''));
  return nullif(btrim(ip), '');
end $$;

create or replace function public.intake_client_hash()
returns text language sql stable as $$
  select case when public.intake_client_ip() is null then null
         else encode(sha256(convert_to('deepsun-intake-v1|' || public.intake_client_ip(), 'UTF8')), 'hex') end
$$;

create or replace function public.leads_intake_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_hash text := public.intake_client_hash(); v_n int;
begin
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  new.whatsapp := nullif(btrim(coalesce(new.whatsapp, '')), '');
  new.message := nullif(btrim(coalesce(new.message, '')), '');
  new.client_hash := v_hash;
  new.status := 'new'; new.handled_by := null; new.handled_at := null; new.admin_notes := null;
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;

  if exists (select 1 from public.leads l where l.email = new.email and l.business_type = new.business_type and l.budget = new.budget
             and l.timeline = new.timeline and l.needs = new.needs and coalesce(l.message, '') = coalesce(new.message, '')
             and l.created_at > now() - interval '24 hours') then
    raise exception 'duplicate_lead' using errcode = 'DS001';
  end if;
  if v_hash is not null then
    select count(*) into v_n from public.leads where client_hash = v_hash and created_at > now() - interval '1 hour';
    if v_n >= 5 then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  end if;
  select count(*) into v_n from public.leads where email = new.email and created_at > now() - interval '24 hours';
  if v_n >= 3 then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  select count(*) into v_n from public.leads where created_at > now() - interval '1 hour';
  if v_n >= 200 then raise exception 'intake_paused' using errcode = 'DS003'; end if;
  return new;
end $$;

drop trigger if exists leads_intake_guard on public.leads;
create trigger leads_intake_guard before insert on public.leads for each row execute function public.leads_intake_guard();

create or replace function public.testimonials_intake_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_hash text := public.intake_client_hash(); v_n int;
begin
  new.name := btrim(new.name);
  new.message := btrim(new.message);
  new.company := nullif(btrim(coalesce(new.company, '')), '');
  new.role := nullif(btrim(coalesce(new.role, '')), '');
  new.client_hash := v_hash;
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  -- Nobody can publish or feature their own submission, whatever the request contains.
  new.approved := false; new.featured := false; new.moderated_by := null; new.moderated_at := null;

  if exists (select 1 from public.testimonials t where t.name = new.name and t.message = new.message and t.created_at > now() - interval '24 hours') then
    raise exception 'duplicate_testimonial' using errcode = 'DS001';
  end if;
  if v_hash is not null then
    select count(*) into v_n from public.testimonials where client_hash = v_hash and created_at > now() - interval '1 hour';
    if v_n >= 3 then raise exception 'rate_limited' using errcode = 'DS002'; end if;
    select count(*) into v_n from public.testimonials where client_hash = v_hash and created_at > now() - interval '24 hours';
    if v_n >= 8 then raise exception 'rate_limited' using errcode = 'DS002'; end if;
  end if;
  select count(*) into v_n from public.testimonials where created_at > now() - interval '1 hour';
  if v_n >= 60 then raise exception 'intake_paused' using errcode = 'DS003'; end if;
  return new;
end $$;

drop trigger if exists testimonials_intake_guard on public.testimonials;
create trigger testimonials_intake_guard before insert on public.testimonials for each row execute function public.testimonials_intake_guard();

-- Moderation: only a platform admin (or a trusted internal connection) may change approved/featured; content can never be edited afterwards.
-- "Trusted" = no API role claim (Supabase dashboard / SQL editor / direct postgres) or service_role. Requests through the API are always 'anon' or 'authenticated'.
create or replace function public.testimonials_moderation_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  if new.approved is distinct from old.approved or new.featured is distinct from old.featured then
    if not public.is_platform_admin() then raise exception 'moderation_not_allowed' using errcode = '42501'; end if;
    new.moderated_by := auth.uid(); new.moderated_at := now();
  end if;
  if new.featured and not new.approved then new.featured := false; end if;
  new.name := old.name; new.company := old.company; new.role := old.role; new.message := old.message; new.rating := old.rating;
  new.avatar_url := old.avatar_url; new.result_image_url := old.result_image_url; new.video_url := old.video_url; new.client_hash := old.client_hash;
  return new;
end $$;

drop trigger if exists testimonials_moderation_guard on public.testimonials;
create trigger testimonials_moderation_guard before update on public.testimonials for each row execute function public.testimonials_moderation_guard();

-- Lead handling by admins: stamp who/when.
create or replace function public.leads_handling_guard()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then return new; end if;
  if not public.is_platform_admin() then raise exception 'not_allowed' using errcode = '42501'; end if;
  if new.status is distinct from old.status then new.handled_by := auth.uid(); new.handled_at := now(); end if;
  new.business_type := old.business_type; new.needs := old.needs; new.budget := old.budget; new.timeline := old.timeline;
  new.name := old.name; new.email := old.email; new.whatsapp := old.whatsapp; new.message := old.message; new.source := old.source; new.client_hash := old.client_hash;
  return new;
end $$;

drop trigger if exists leads_handling_guard on public.leads;
create trigger leads_handling_guard before update on public.leads for each row execute function public.leads_handling_guard();

-- ──────────────────────────────────────────────────────────── RLS + grants ──

do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('leads', 'testimonials') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.leads enable row level security;
alter table public.testimonials enable row level security;

revoke all on public.leads from public, anon, authenticated;
revoke all on public.testimonials from public, anon, authenticated;

-- leads: anyone may submit; only platform admins may read / triage / delete.
grant insert (business_type, needs, budget, timeline, name, email, whatsapp, message, source) on public.leads to anon, authenticated;
grant select (id, created_at, business_type, needs, budget, timeline, name, email, whatsapp, message, source, status, admin_notes, handled_by, handled_at) on public.leads to authenticated;
grant update (status, admin_notes) on public.leads to authenticated;
grant delete on public.leads to authenticated;

create policy "leads public insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads admin select" on public.leads for select to authenticated using (public.is_platform_admin());
create policy "leads admin update" on public.leads for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "leads admin delete" on public.leads for delete to authenticated using (public.is_platform_admin());

-- testimonials: anyone may submit (always unapproved); the public sees only approved rows; admins moderate.
grant insert (name, company, role, message, rating, avatar_url, result_image_url, video_url, approved) on public.testimonials to anon, authenticated;
grant select (id, created_at, name, company, role, message, rating, avatar_url, result_image_url, video_url, approved, featured, moderated_at) on public.testimonials to anon, authenticated;
grant update (approved, featured) on public.testimonials to authenticated;
grant delete on public.testimonials to authenticated;

create policy "testimonials public insert unapproved" on public.testimonials for insert to anon, authenticated with check (approved = false and featured = false);
create policy "testimonials public read approved" on public.testimonials for select to anon, authenticated using (approved = true);
create policy "testimonials admin read all" on public.testimonials for select to authenticated using (public.is_platform_admin());
create policy "testimonials admin update" on public.testimonials for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "testimonials admin delete" on public.testimonials for delete to authenticated using (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────────── Storage ──
-- Public-read buckets (images/videos are shown on the site once a testimonial is approved). Size and MIME limits are enforced by
-- Storage itself. Uploads are anonymous but restricted by bucket and file-name pattern; nothing can be listed, overwritten or deleted
-- by the public. LIMITATION: the MIME type is the one declared by the client; unapproved files are reachable by whoever knows the
-- random URL. Orphan files (uploads without a testimonial) need a periodic cleanup.

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
  (bucket_id in ('testimonial-avatars', 'testimonial-results') and name ~ '^[0-9]{10,14}-[a-z0-9]{4,24}\.(png|jpe?g|webp)$')
  or (bucket_id = 'testimonial-videos' and name ~ '^[0-9]{10,14}-[a-z0-9]{4,24}\.(mp4|mov|webm)$')
);
create policy "intake admin manage testimonial files" on storage.objects for all to authenticated
  using (bucket_id in ('testimonial-avatars', 'testimonial-results', 'testimonial-videos') and public.is_platform_admin())
  with check (bucket_id in ('testimonial-avatars', 'testimonial-results', 'testimonial-videos') and public.is_platform_admin());

drop function public._intake_ensure_check(regclass, text, text);
