// Local Postgres (PGlite, WASM — no network) that imitates the parts of Supabase our migrations rely on:
// roles anon/authenticated/service_role, auth.uid()/auth.role() driven by request.jwt.claim.*, a storage schema,
// PostgREST-style request.headers, and Supabase's default privileges (ALL on new public tables for the API roles).
// It proves schema, constraints, triggers, RLS and grants. It does NOT prove behaviour of the hosted platform
// (header names, Storage API enforcement, PostgREST error mapping) — see docs/PRUEBAS_STAGING_SUPABASE.md.
import fs from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const MIGRATIONS = new URL('../../supabase/migrations/', import.meta.url)

const STUBS = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users(id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role', true),'') $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
create schema storage;
create table storage.buckets(id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, owner_id text, created_at timestamptz default now(), metadata jsonb);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
create function storage.filename(name text) returns text language sql immutable as $$ select (string_to_array(name, '/'))[array_length(string_to_array(name, '/'),1)] $$;
create publication supabase_realtime;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema storage to authenticated;
grant insert on storage.objects to anon;
`

export type Role = 'postgres' | 'anon' | 'authenticated' | 'service_role'

export async function makeDb(opts: { only?: string[] } = {}) {
  const db = new PGlite({ extensions: { pgcrypto } })
  await db.exec(STUBS)
  const files = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort().filter((f) => !opts.only || opts.only.includes(f))
  for (const f of files) await db.exec(fs.readFileSync(new URL(f, MIGRATIONS), 'utf8'))
  return db
}

/** Act as an API role (what PostgREST does): set the role + JWT claims + request headers. `postgres` = dashboard/SQL editor. */
export async function as(db: PGlite, role: Role, o: { sub?: string; headers?: Record<string, string> } = {}) {
  await db.exec('reset role')
  const claimRole = role === 'postgres' ? '' : role
  const h = JSON.stringify(o.headers ?? {}).replace(/'/g, "''")
  await db.exec(`select set_config('request.jwt.claim.sub','${o.sub ?? ''}',false), set_config('request.jwt.claim.role','${claimRole}',false), set_config('request.headers','${h}',false)`)
  if (role !== 'postgres') await db.exec(`set role ${role}`)
}

/** Run a statement and return the Postgres error (code + message) or null. */
export async function failure(db: PGlite, sql: string, params: unknown[] = []): Promise<{ code: string; message: string } | null> {
  try {
    await db.query(sql, params)
    return null
  } catch (e) {
    const err = e as { code?: string; message: string }
    return { code: err.code ?? '', message: err.message }
  }
}
