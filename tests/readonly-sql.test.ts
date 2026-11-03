// Guards supabase/verification/intake_state_readonly.sql — the script the owner will paste into the PRODUCTION SQL editor.
// It must be strictly read-only, call only harmless functions and never select personal data.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { makeDb, as } from './support/db.ts'

const FILE = new URL('../supabase/verification/intake_state_readonly.sql', import.meta.url)
const raw = fs.readFileSync(FILE, 'utf8')
const statements = raw.replace(/--[^\n]*/g, '').split(';').map((s) => s.trim()).filter(Boolean)

test('the file contains only SELECT statements (no writes, DDL, locks, transaction or session control)', () => {
  assert.ok(statements.length >= 10)
  const forbidden = /\b(insert|update|delete|drop|alter|create|grant|revoke|truncate|copy|call|do|execute|set|reset|vacuum|analyze|notify|listen|lock|refresh|begin|commit|rollback|savepoint|comment|merge|into|share|prepare|deallocate|discard|reindex|cluster|import|security)\b/i
  for (const s of statements) {
    assert.match(s, /^(select|with)\b/i, `must start with SELECT: ${s.slice(0, 60)}`)
    const noStrings = s.replace(/'[^']*'/g, "''")
    assert.doesNotMatch(noStrings, forbidden, `forbidden keyword in: ${s.slice(0, 80)}`)
  }
})

test('only harmless functions are called (no side effects, no dynamic SQL, no file or network access)', () => {
  const allowed = new Set(['count', 'min', 'max', 'string_agg', 'current_setting', 'has_table_privilege', 'has_column_privilege', 'has_function_privilege', 'pg_get_triggerdef', 'pg_get_function_identity_arguments', 'r', 'p' /* column-alias lists: as r(grantee), as p(priv) */, 'in', 'not', 'and', 'or', 'on', 'where', 'from', 'as', 'select', 'union', 'all', 'exists', 'between', 'order', 'by', 'group', 'left', 'join', 'values', 'is', 'like'])
  const found = new Set<string>()
  for (const s of statements) {
    const noStrings = s.replace(/'[^']*'/g, "''")
    for (const m of noStrings.matchAll(/\b([a-z_][a-z0-9_]*)\s*\(/gi)) found.add(m[1].toLowerCase())
  }
  const unexpected = [...found].filter((f) => !allowed.has(f))
  assert.deepEqual(unexpected, [], 'every called function must be on the allowlist')
  assert.doesNotMatch(raw.replace(/--[^\n]*/g, ''), /pg_sleep|pg_read|dblink|lo_|set_config|nextval|setval|query_to_xml|pg_terminate|pg_cancel|http_|net\./i)
})

test('no personal data is ever selected: our two tables are only counted or summarised', () => {
  const personal = /\b(name|email|whatsapp|message|admin_notes|company|role|avatar_url|result_image_url|video_url|client_hash|business_type|needs|budget|timeline|id)\b/i
  for (const s of statements.filter((x) => /public\.(leads|testimonials)\b/i.test(x))) {
    for (const part of s.split(/\bunion all\b/i)) {
      const m = /select\s+([\s\S]*?)\s+from\s+public\.(leads|testimonials)\b/i.exec(part)
      if (!m) continue
      const list = m[1].replace(/'[^']*'/g, "''")
      assert.doesNotMatch(list.replace(/count\(\*\)|min\(created_at\)|max\(created_at\)/gi, ''), personal, `personal column in select list: ${m[1]}`)
    }
  }
})

test('it runs without errors on the legacy (pre-migration) and migrated databases and changes nothing', async () => {
  const sqlFile = fs.readFileSync(new URL('../supabase/migrations/202611030001_public_intake.sql', import.meta.url), 'utf8')
  for (const mode of ['legacy', 'migrated'] as const) {
    const legacyOnly = ['202609290001_portal_core.sql', '202609290002_rls_storage_audit.sql']
    const db = await makeDb({ only: mode === 'migrated' ? [...legacyOnly, '202609300003_project_tracking.sql', '202609300004_project_tracking_rls.sql'] : legacyOnly })
    await as(db, 'postgres')
    await db.exec(`create table public.leads (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), business_type text, needs text[], budget text, timeline text, name text, email text, whatsapp text, message text);
      create table public.testimonials (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), name text, company text, role text, message text, rating int, avatar_url text, result_image_url text, video_url text, approved boolean default false, featured boolean default false);
      insert into public.leads (business_type, needs, budget, timeline, name, email) values ('hotel','{asesoria}','no_se','asap','Ficticio Uno','uno@example.test');
      insert into public.testimonials (name, message, rating) values ('Ficticia Dos','Texto ficticio de prueba para el inventario.',5);`)
    if (mode === 'migrated') {
      await db.exec(sqlFile)
      for (const f of ['202611030002_fix_storage_document_read.sql', '202611030003_harden_privileges.sql']) await db.exec(fs.readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), 'utf8'))
    }
    const counts = async () => (await db.query<{ t: string; n: number }>(`select 'leads' t, count(*)::int n from public.leads union all select 'testimonials', count(*)::int from public.testimonials union all select 'policies', count(*)::int from pg_policies`)).rows
    const before = await counts()
    await db.exec('begin read only')
    for (const s of statements) await db.query(s)
    // control: the read-only transaction really refuses writes
    await assert.rejects(db.query(`insert into public.leads (business_type, needs, budget, timeline, name, email) values ('hotel','{asesoria}','no_se','asap','X','x@example.test')`), /read-only transaction/i)
    await db.exec('rollback')
    assert.deepEqual(await counts(), before, `${mode}: nothing changed`)
  }
})
