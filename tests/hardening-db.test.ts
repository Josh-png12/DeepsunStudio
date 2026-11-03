// Regression tests for the problems found by the read-only production audit (docs/AUDITORIA_PRODUCCION.md).
// Each block first REPRODUCES the problem on a database that has only the migrations already in production
// (202609290001 … 202609300004), then applies the fix (202611030002 + 202611030003) to the SAME database and proves it is closed
// without breaking what RLS and the portal need. Local Postgres only — see tests/support/db.ts for what that does and does not prove.
import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import type { PGlite } from '@electric-sql/pglite'
import { makeDb, as, failure } from './support/db.ts'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const ADMIN = id(1), INV_A = id(2), INV_B = id(3), ADMIN_A = id(4)
const AG_A = id(10), AG_B = id(11)
const P_A = id(20), P_A_HIDDEN = id(21), P_B = id(22)
const read = (f: string) => fs.readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), 'utf8')
const PRODUCTION_STATE = ['202609290001_portal_core.sql', '202609290002_rls_storage_audit.sql', '202609300003_project_tracking.sql', '202609300004_project_tracking_rls.sql']

let db: PGlite

const names = async (sub: string, sql: string) => {
  await as(db, 'authenticated', { sub })
  const f = await failure(db, sql)
  return f ? ['DENIED:' + f.code] : (await db.query<{ name: string }>(sql)).rows.map((r) => r.name)
}
const sql = async (q: string) => { await as(db, 'postgres'); await db.exec(q) }
const readable = (sub: string) => names(sub, `select name from storage.objects where bucket_id='agreement-documents' order by name`)

before(async () => {
  db = await makeDb({ only: PRODUCTION_STATE })
  await as(db, 'postgres')
  await db.exec(`
    insert into auth.users(id, email) values ('${ADMIN}','admin@t.test'),('${INV_A}','inversor-a@t.test'),('${INV_B}','inversor-b@t.test'),('${ADMIN_A}','admin-a@t.test');
    alter table public.profiles disable trigger protect_profile_role_trigger;
    update public.profiles set role='admin' where id='${ADMIN}';
    alter table public.profiles enable trigger protect_profile_role_trigger;
    insert into public.agreements (id, name, initial_contribution, participation_percentage, contractual_cap, start_date) values
      ('${AG_A}','Acuerdo A',1000,10,5000,'2026-01-01'),('${AG_B}','Acuerdo B',2000,20,9000,'2026-01-01');
    insert into public.agreement_members (agreement_id, user_id, role) values
      ('${AG_A}','${INV_A}','investor'),('${AG_A}','${ADMIN_A}','admin'),('${AG_B}','${INV_B}','investor');
    insert into public.projects (id, agreement_id, name, slug, public_name, investor_visible, status) values
      ('${P_A}','${AG_A}','Proyecto A','proyecto-a','Proyecto A',true,'active'),
      ('${P_A_HIDDEN}','${AG_A}','Proyecto interno A','interno-a','Proyecto interno A',false,'active'),
      ('${P_B}','${AG_B}','Proyecto B','proyecto-b','Proyecto B',true,'active');
    insert into public.documents (id, agreement_id, project_id, uploaded_by, name, storage_path, mime_type, size, investor_visible) values
      ('${id(30)}','${AG_A}',null,'${ADMIN}','contrato.pdf','${AG_A}/contrato.pdf','application/pdf',1000,true),
      ('${id(31)}','${AG_A}',null,'${ADMIN}','interno.pdf','${AG_A}/interno.pdf','application/pdf',1000,false),
      ('${id(32)}','${AG_A}','${P_A_HIDDEN}','${ADMIN}','de-proyecto-oculto.pdf','${AG_A}/de-proyecto-oculto.pdf','application/pdf',1000,true);
    insert into storage.objects (bucket_id, name) values
      ('agreement-documents','${AG_A}/contrato.pdf'),('agreement-documents','${AG_A}/interno.pdf'),
      ('agreement-documents','${AG_A}/de-proyecto-oculto.pdf'),('agreement-documents','${AG_B}/secreto-de-B.pdf');`)
})

// ─────────────────────────────────────────────── Storage read authorization (002) ──
test('BEFORE 002: a member cannot open a document the admin marked visible (defect 1)', async () => {
  assert.deepEqual(await readable(INV_A), [], 'the production policy compares documents.name with itself, so the legitimate file is unreachable')
})

test('BEFORE 002: one document whose display name equals its storage path opens EVERY file of the bucket, other agreements included (defect 2)', async () => {
  await as(db, 'postgres')
  await db.exec(`insert into public.documents (id, agreement_id, uploaded_by, name, storage_path, mime_type, size, investor_visible)
    values ('${id(33)}','${AG_A}','${ADMIN}','trampa.pdf','trampa.pdf','application/pdf',1,true);`)
  const seen = await readable(INV_A)
  await as(db, 'postgres')
  await db.exec(`delete from public.documents where id='${id(33)}'`)
  assert.ok(seen.includes(`${AG_B}/secreto-de-B.pdf`), 'investor of A reads the private file of agreement B')
  assert.ok(seen.includes(`${AG_A}/interno.pdf`), 'and the file the admin kept private')
})

test('AFTER 002: members read exactly the visible documents of their own agreement, nothing else', async () => {
  await as(db, 'postgres')
  await db.exec(read('202611030002_fix_storage_document_read.sql'))
  assert.deepEqual(await readable(INV_A), [`${AG_A}/contrato.pdf`], 'visible, own agreement, no project → readable; private file and file of a hidden project are not')
  assert.deepEqual(await readable(INV_B), [], 'investor of B has no visible document: reads nothing of A')
  assert.deepEqual(await readable(ADMIN_A), [`${AG_A}/contrato.pdf`, `${AG_A}/de-proyecto-oculto.pdf`, `${AG_A}/interno.pdf`], 'agreement admin reads its whole folder and only its folder')
  assert.equal((await readable(ADMIN)).length, 4, 'platform admin keeps reading everything')
  await as(db, 'anon')
  assert.ok((await failure(db, `select name from storage.objects`)) || (await db.query(`select name from storage.objects`)).rows.length === 0, 'anonymous reads nothing')
})

test('AFTER 002: the trap that used to open the whole bucket is closed, and so is a foreign path written into a documents row', async () => {
  await as(db, 'postgres')
  await db.exec(`insert into public.documents (id, agreement_id, uploaded_by, name, storage_path, mime_type, size, investor_visible)
    values ('${id(33)}','${AG_A}','${ADMIN}','trampa.pdf','trampa.pdf','application/pdf',1,true),
           ('${id(34)}','${AG_A}','${ADMIN}','robo.pdf','${AG_B}/secreto-de-B.pdf','application/pdf',1,true);`)
  const seen = await readable(INV_A)
  await as(db, 'postgres')
  await db.exec(`delete from public.documents where id in ('${id(33)}','${id(34)}')`)
  assert.deepEqual(seen, [`${AG_A}/contrato.pdf`], 'name = storage_path no longer widens access; a row of agreement A cannot expose a file stored in the folder of B')
})

test('AFTER 002: hiding the document, hiding its project, or leaving the agreement closes the file immediately', async () => {
  await sql(`update public.documents set investor_visible=false where id='${id(30)}'`)
  assert.deepEqual(await readable(INV_A), [])
  await sql(`update public.documents set investor_visible=true where id='${id(30)}'`)
  assert.deepEqual(await readable(INV_A), [`${AG_A}/contrato.pdf`])
  await sql(`update public.documents set project_id='${P_A}' where id='${id(30)}'`)
  assert.deepEqual(await readable(INV_A), [`${AG_A}/contrato.pdf`], 'visible project → still readable')
  await sql(`update public.projects set investor_visible=false where id='${P_A}'`)
  assert.deepEqual(await readable(INV_A), [], 'project hidden → file hidden, exactly like the documents row')
  await sql(`update public.projects set investor_visible=true where id='${P_A}'; update public.documents set project_id=null where id='${id(30)}'`)
  await sql(`delete from public.agreement_members where user_id='${INV_A}'`)
  assert.deepEqual(await readable(INV_A), [])
  await sql(`insert into public.agreement_members (agreement_id, user_id, role) values ('${AG_A}','${INV_A}','investor')`)
})

// ───────────────────────────────────────────────── least privilege (003) ──
const rpc = async (role: 'anon' | 'authenticated', sub: string | undefined, sql: string) => {
  await as(db, role, { sub })
  const f = await failure(db, sql)
  return f ? ({ error: f.code, message: f.message } as const) : ({ value: (await db.query<{ v: unknown }>(sql)).rows[0]?.v } as const)
}
const has = async (role: string, table: string, priv: string) =>
  (await db.query<{ v: boolean }>(`select has_table_privilege('${role}', 'public.${table}', '${priv}') v`)).rows[0].v

test('BEFORE 003: anonymous callers can probe who is a platform admin / agreement member through the helper functions', async () => {
  assert.deepEqual(await rpc('anon', undefined, `select public.is_platform_admin('${ADMIN}') v`), { value: true })
  assert.deepEqual(await rpc('anon', undefined, `select public.is_agreement_member('${AG_A}', '${INV_A}') v`), { value: true })
  assert.deepEqual(await rpc('authenticated', INV_B, `select public.is_platform_admin('${ADMIN}') v`), { value: true }, 'any signed-in user can ask about anybody')
})

test('BEFORE 003: the API roles hold TRUNCATE and anon holds every privilege on the portal tables', async () => {
  assert.equal(await has('authenticated', 'transactions', 'truncate'), true)
  assert.equal(await has('anon', 'transactions', 'truncate'), true)
  assert.equal(await has('anon', 'profiles', 'select'), true)
  assert.equal(await has('authenticated', 'audit_logs', 'delete'), true)
})

test('BEFORE 003: an admin of agreement A can write confirmed ledger rows into a project of agreement B', async () => {
  await as(db, 'authenticated', { sub: ADMIN_A })
  const f = await failure(db, `insert into public.transactions (agreement_id, project_id, type, amount, effective_date, status, description, created_by)
    values ('${AG_A}','${P_B}','income',999,'2026-02-01','confirmed','inyectado desde A','${ADMIN_A}')`)
  assert.equal(f, null, 'accepted: plain foreign key only')
  await as(db, 'postgres')
  await db.exec(`alter table public.transactions disable trigger protect_confirmed_transaction_trigger; delete from public.transactions where description='inyectado desde A'; alter table public.transactions enable trigger protect_confirmed_transaction_trigger`)
})

test('AFTER 003: helpers only answer about the caller; anonymous callers cannot execute them at all', async () => {
  await as(db, 'postgres')
  await db.exec(read('202611030003_harden_privileges.sql'))
  assert.equal((await rpc('anon', undefined, `select public.is_platform_admin('${ADMIN}') v`)).error, '42501')
  assert.equal((await rpc('anon', undefined, `select public.is_agreement_member('${AG_A}', '${INV_A}') v`)).error, '42501')
  assert.equal((await rpc('anon', undefined, `select public.is_agreement_admin('${AG_A}', '${ADMIN_A}') v`)).error, '42501')
  assert.equal((await rpc('anon', undefined, `select public.project_accepts_financials('${P_A}') v`)).error, '42501')
  assert.equal((await rpc('anon', undefined, `select public.calculate_project_participation('${P_A}','${INV_A}','x') v`)).error, '42501')
  // signed-in: own answers are true, answers about someone else are false (no oracle)
  assert.deepEqual(await rpc('authenticated', ADMIN, `select public.is_platform_admin('${ADMIN}') v`), { value: true })
  assert.deepEqual(await rpc('authenticated', INV_B, `select public.is_platform_admin('${ADMIN}') v`), { value: false })
  assert.deepEqual(await rpc('authenticated', INV_B, `select public.is_agreement_member('${AG_A}', '${INV_A}') v`), { value: false })
  assert.deepEqual(await rpc('authenticated', INV_A, `select public.is_agreement_member('${AG_A}') v`), { value: true })
  assert.deepEqual(await rpc('authenticated', ADMIN_A, `select public.is_agreement_admin('${AG_A}', '${ADMIN_A}') v`), { value: true })
  assert.deepEqual(await rpc('authenticated', INV_B, `select public.is_agreement_admin('${AG_A}', '${ADMIN_A}') v`), { value: false })
  // internal callers (dashboard / SQL editor / service role) still can ask about anyone
  await as(db, 'postgres')
  assert.equal((await db.query<{ v: boolean }>(`select public.is_platform_admin('${ADMIN}') v`)).rows[0].v, true)
  await as(db, 'service_role')
  assert.equal((await db.query<{ v: boolean }>(`select public.is_agreement_admin('${AG_A}', '${ADMIN_A}') v`)).rows[0].v, true)
})

test('AFTER 003: trigger functions cannot be called from the API, and they still fire', async () => {
  for (const fn of ['write_audit_log', 'notify_project_event', 'protect_profile_role', 'apply_project_update_snapshot', 'enforce_project_same_agreement']) {
    for (const role of ['anon', 'authenticated'] as const) {
      const r = await db.query<{ v: boolean }>(`select has_function_privilege('${role}', 'public.${fn}()', 'execute') v`)
      assert.equal(r.rows[0].v, false, `${role} must not execute ${fn}`)
    }
  }
  // the audit trigger still writes when an authenticated admin updates a project (trigger functions need no EXECUTE to fire)
  await as(db, 'authenticated', { sub: ADMIN_A })
  assert.equal(await failure(db, `update public.projects set current_focus='enfoque nuevo' where id='${P_A}'`), null)
  await as(db, 'postgres')
  assert.ok((await db.query<{ n: number }>(`select count(*)::int n from public.audit_logs where entity_type='projects' and entity_id='${P_A}'`)).rows[0].n > 0)
})

test('AFTER 003: no TRUNCATE for anybody on the API; anon has nothing on the portal tables; audit trail is read-only for the API', async () => {
  for (const t of ['transactions', 'participations', 'payments', 'audit_logs', 'documents', 'profiles']) {
    assert.equal(await has('authenticated', t, 'truncate'), false, `authenticated truncate ${t}`)
    assert.equal(await has('anon', t, 'truncate'), false, `anon truncate ${t}`)
  }
  for (const t of ['profiles', 'agreements', 'agreement_members', 'projects', 'documents', 'transactions', 'participations', 'payments', 'audit_logs', 'notifications']) {
    for (const p of ['select', 'insert', 'update', 'delete']) assert.equal(await has('anon', t, p), false, `anon ${p} ${t}`)
  }
  for (const p of ['insert', 'update', 'delete']) assert.equal(await has('authenticated', 'audit_logs', p), false, `authenticated ${p} audit_logs`)
  assert.equal(await has('authenticated', 'audit_logs', 'select'), true, 'admins still read the audit trail')
  assert.equal(await has('service_role', 'transactions', 'truncate'), true, 'service role is untouched')
})

test('AFTER 003: the portal still works as an admin and as an investor (RLS helpers, ledger, RPC, notifications)', async () => {
  // investor reads, admin writes: the policies call the helpers as the invoking role
  assert.deepEqual(await names(INV_A, `select name from public.projects order by name`), ['Proyecto A'])
  await as(db, 'authenticated', { sub: ADMIN_A })
  assert.equal(await failure(db, `insert into public.transactions (agreement_id, project_id, type, amount, effective_date, status, description, created_by)
    values ('${AG_A}','${P_A}','income',1000,'2026-02-01','confirmed','ingreso legítimo','${ADMIN_A}')`), null, 'admin records income in its own project')
  const calc = await rpc('authenticated', ADMIN_A, `select public.calculate_project_participation('${P_A}','${INV_A}','prueba de regresión') v`)
  assert.ok('value' in calc && typeof calc.value === 'string', `admin can run the participation RPC: ${JSON.stringify(calc)}`)
  assert.match((await rpc('authenticated', INV_A, `select public.calculate_project_participation('${P_A}','${INV_A}','x') v`)).message ?? '', /Not authorized/, 'investors still cannot')
  assert.match((await rpc('authenticated', INV_B, `select public.calculate_project_participation('${P_A}','${INV_A}','x') v`)).message ?? '', /Not authorized/, 'nor can another agreement\'s investor')
  // participation is visible to its investor
  assert.ok((await names(INV_A, `select id::text as name from public.participations`)).length >= 1)
  // new members still get a profile through the auth trigger
  await as(db, 'postgres')
  await db.exec(`insert into auth.users(id, email) values ('${id(99)}','nuevo@t.test')`)
  assert.equal((await db.query<{ n: number }>(`select count(*)::int n from public.profiles where id='${id(99)}'`)).rows[0].n, 1)
})

test('AFTER 003: a project from another agreement can no longer be referenced by ledger, documents or participations', async () => {
  await as(db, 'authenticated', { sub: ADMIN_A })
  const tx = await failure(db, `insert into public.transactions (agreement_id, project_id, type, amount, effective_date, status, description, created_by)
    values ('${AG_A}','${P_B}','income',999,'2026-02-01','confirmed','inyectado desde A','${ADMIN_A}')`)
  assert.match(tx?.message ?? '', /project_agreement_mismatch/)
  const doc = await failure(db, `insert into public.documents (agreement_id, project_id, uploaded_by, name, storage_path, mime_type, size)
    values ('${AG_A}','${P_B}','${ADMIN_A}','x.pdf','${AG_A}/x.pdf','application/pdf',1)`)
  assert.match(doc?.message ?? '', /project_agreement_mismatch/)
  await as(db, 'postgres')
  const part = await failure(db, `insert into public.participations (agreement_id, project_id, investor_id, gross_income, deductible_costs, net_profit, percentage, amount, status)
    values ('${AG_A}','${P_B}','${INV_A}',1,0,1,10,1,'calculated')`)
  assert.match(part?.message ?? '', /project_agreement_mismatch/)
  // rows without a project, and rows of the right agreement, are untouched
  await as(db, 'authenticated', { sub: ADMIN_A })
  assert.equal(await failure(db, `insert into public.transactions (agreement_id, type, amount, effective_date, status, description, created_by)
    values ('${AG_A}','income',5,'2026-02-02','draft','sin proyecto','${ADMIN_A}')`), null)
})

test('003 is idempotent and 003 + 002 re-applied change nothing', async () => {
  await as(db, 'postgres')
  await db.exec(read('202611030002_fix_storage_document_read.sql'))
  await db.exec(read('202611030003_harden_privileges.sql'))
  assert.deepEqual(await readable(INV_A), [`${AG_A}/contrato.pdf`])
  assert.deepEqual(await rpc('authenticated', INV_B, `select public.is_platform_admin('${ADMIN}') v`), { value: false })
})

test('the 003 rollback restores exactly the audited production privileges and leaves the portal working', async () => {
  const d = await makeDb({ only: PRODUCTION_STATE })
  await d.exec(read('202611030002_fix_storage_document_read.sql'))
  await d.exec(read('202611030003_harden_privileges.sql'))
  await d.exec(fs.readFileSync(new URL('../supabase/rollback/202611030003_harden_privileges_rollback.sql', import.meta.url), 'utf8'))
  const q = async (sql: string) => (await d.query<{ v: boolean }>(sql)).rows[0].v
  assert.equal(await q(`select has_function_privilege('anon', 'public.is_platform_admin(uuid)', 'execute') v`), true)
  assert.equal(await q(`select has_table_privilege('authenticated', 'public.transactions', 'truncate') v`), true)
  assert.equal(await q(`select has_table_privilege('anon', 'public.profiles', 'select') v`), true)
  assert.equal((await d.query(`select 1 from pg_trigger where tgname like 'enforce_project_same_agreement%'`)).rows.length, 0)
  await d.close()
})

// ─────────────────────────────────────────── full rollback of the intake migration (001) ──
test('rollback of a fresh install: refuses while rows exist, then removes tables, functions and Storage policies and leaves the portal as it was', async () => {
  const rb = fs.readFileSync(new URL('../supabase/rollback/202611030001_public_intake_rollback_fresh_install.sql', import.meta.url), 'utf8')
  const policies = async (d: PGlite) => (await d.query<{ p: string }>(`select policyname p from pg_policies where schemaname in ('public','storage') order by 1`)).rows.map((r) => r.p)
  const reference = await makeDb({ only: PRODUCTION_STATE })
  await reference.exec(read('202611030002_fix_storage_document_read.sql'))
  await reference.exec(read('202611030003_harden_privileges.sql'))
  const expected = await policies(reference)
  await reference.close()

  const d = await makeDb() // every migration: 001 (intake) + 002 + 003
  await d.exec(`insert into public.leads (business_type, needs, budget, timeline, name, email) values ('hotel','{asesoria}','no_se','asap','Ficticio Uno','uno@example.test')`)
  await assert.rejects(d.exec(rb), /public\.leads still holds rows/)
  await d.exec('rollback') // what the SQL editor does after an error
  assert.ok((await d.query(`select 1 from pg_policies where policyname = 'intake upload testimonial files'`)).rows.length === 1, 'refusal is atomic: nothing was removed')
  await d.exec(`delete from public.leads`)

  await d.exec(fs.readFileSync(new URL('../supabase/rollback/202611030003_harden_privileges_rollback.sql', import.meta.url), 'utf8'))
  await d.exec(rb)
  assert.equal(await d.query(`select to_regclass('public.leads') a, to_regclass('public.testimonials') b, to_regclass('public.intake_settings') c`).then((r) => JSON.stringify(r.rows[0])), '{"a":null,"b":null,"c":null}')
  assert.equal((await d.query(`select 1 from pg_proc where proname like 'intake\_%' or proname like '%\_intake\_guard' or proname like '%\_moderation\_guard'`)).rows.length, 0)
  assert.deepEqual(await policies(d), expected, 'public + storage policies are exactly those of the portal without the intake feature')
  // Storage buckets are intentionally left (cannot be deleted from SQL in Supabase): the upload policy is gone, so the public cannot write.
  await as(d, 'anon')
  assert.equal((await failure(d, `insert into storage.objects (bucket_id, name) values ('testimonial-avatars','1700000000-abcd1234.png')`))?.code, '42501')
  await d.close()
})
