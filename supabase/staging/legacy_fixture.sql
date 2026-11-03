-- STAGING ONLY. Recreates a hand-made, permissive "legacy" setup like the one production probably has, with SYNTHETIC rows only,
-- so you can rehearse supabase/migrations/202611030001_public_intake.sql (and its rollback) before touching production.
-- Never copy real leads/testimonials into staging. Adjust the table definitions to what block 2 of intake_state_readonly.sql shows in production.
-- Do NOT run on production.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  business_type text, needs text[], budget text, timeline text, name text, email text, whatsapp text, message text);
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  name text, company text, role text, message text, rating int, avatar_url text, result_image_url text, video_url text,
  approved boolean default false, featured boolean default false);

alter table public.leads disable row level security;                       -- worst case seen in hand-made tables
alter table public.testimonials enable row level security;
drop policy if exists "legacy open" on public.testimonials;
create policy "legacy open" on public.testimonials for all to public using (true) with check (true);

insert into public.leads (business_type, needs, budget, timeline, name, email, message) values
  ('hotel', '{sitio_nuevo}', 'no_se', 'asap', '[staging-test] Ficticio Uno', 'uno@example.test', 'fila sintética'),
  ('otro', '{asesoria}', 'menos_500', 'explorando', '[staging-test] Ficticio Dos', 'dos@example.test', null),
  ('casino', '{otra}', 'infinito', 'ayer', '[staging-test] Fila con valores antiguos', 'no-es-correo', null);   -- violates the new CHECKs on purpose
insert into public.testimonials (name, message, rating, approved) values
  ('[staging-test] Aprobada', 'Texto ficticio de reseña ya aprobada para pruebas.', 5, true),
  ('[staging-test] Pendiente', 'Texto ficticio de reseña pendiente para pruebas.', 4, false);
