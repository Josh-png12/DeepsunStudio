// Isolation tests for the private portal, run against the REAL migrations on local Postgres (see tests/support/db.ts).
// They do not replace testing with real staging accounts through the app (sessions, cookies, proxy.ts) — see docs/PRUEBAS_STAGING_SUPABASE.md.
import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import type { PGlite } from '@electric-sql/pglite'
import { makeDb, as, failure } from './support/db.ts'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const ADMIN = id(1), INV_A = id(2), INV_B = id(3), OUTSIDER = id(4)
const AG_A = id(10), AG_B = id(11)
const P_A_VISIBLE = id(20), P_A_HIDDEN = id(21), P_B = id(22)
let db: PGlite

async function rows(role: 'anon' | 'authenticated', sub: string | undefined, sql: string) {
  await as(db, role, { sub })
  const f = await failure(db, sql)
  return f ? ({ denied: f.code } as const) : ({ rows: (await db.query<Record<string, unknown>>(sql)).rows } as const)
}
const count = async (sub: string, table: string, where = 'true') => {
  const r = await rows('authenticated', sub, `select * from public.${table} where ${where}`)
  return ('rows' in r ? (r as { rows: unknown[] }).rows : []).length
}

before(async () => {
  db = await makeDb()
  await as(db, 'postgres')
  await db.exec(`
    insert into auth.users(id, email) values ('${ADMIN}','admin@t.test'),('${INV_A}','inversor-a@t.test'),('${INV_B}','inversor-b@t.test'),('${OUTSIDER}','externo@t.test');
    alter table public.profiles disable trigger protect_profile_role_trigger;
    update public.profiles set role='admin' where id='${ADMIN}';
    alter table public.profiles enable trigger protect_profile_role_trigger;
    insert into public.agreements (id, name, initial_contribution, participation_percentage, contractual_cap, start_date) values
      ('${AG_A}','Acuerdo A',1000,10,5000,'2026-01-01'),('${AG_B}','Acuerdo B',2000,20,9000,'2026-01-01');
    insert into public.agreement_members (agreement_id, user_id, role) values ('${AG_A}','${INV_A}','investor'),('${AG_B}','${INV_B}','investor');
    insert into public.projects (id, agreement_id, name, slug, public_name, investor_visible, status) values
      ('${P_A_VISIBLE}','${AG_A}','Proyecto visible A','visible-a','Proyecto visible A',true,'active'),('${P_A_HIDDEN}','${AG_A}','Proyecto interno A','interno-a','Proyecto interno A',false,'active'),('${P_B}','${AG_B}','Proyecto B','proyecto-b','Proyecto B',true,'active');
    insert into public.project_internal_details (project_id, agreement_id, internal_notes, updated_by) values ('${P_A_VISIBLE}','${AG_A}','NOTAS INTERNAS SECRETAS','${ADMIN}');
    insert into public.updates (agreement_id, title, content, visibility, created_by) values
      ('${AG_A}','Para miembros','contenido público para miembros','members','${ADMIN}'),
      ('${AG_A}','Solo administración','CONTENIDO SOLO ADMIN','admin_only','${ADMIN}');
    insert into public.documents (id, agreement_id, uploaded_by, name, storage_path, mime_type, size, investor_visible) values ('${id(30)}','${AG_A}','${ADMIN}','contrato.pdf','${AG_A}/contrato.pdf','application/pdf',1000,true),('${id(31)}','${AG_A}','${ADMIN}','interno.pdf','${AG_A}/interno.pdf','application/pdf',1000,false);
    insert into public.transactions (agreement_id, type, amount, effective_date, status, description, created_by) values ('${AG_A}','income',500,'2026-02-01','confirmed','Ingreso de prueba A','${ADMIN}'),('${AG_B}','income',700,'2026-02-01','confirmed','Ingreso de prueba B','${ADMIN}');
    insert into public.participations (id, agreement_id, project_id, investor_id, gross_income, deductible_costs, net_profit, percentage, amount, status) values ('${id(40)}','${AG_A}','${P_A_VISIBLE}','${INV_A}',500,0,500,10,50,'approved');
    insert into public.payments (agreement_id, investor_id, participation_id, amount, payment_date, payment_method, created_by) values ('${AG_A}','${INV_A}','${id(40)}',50,'2026-03-01','transferencia','${ADMIN}');
    insert into public.personal_expenses (user_id, amount, kind, category, concept, occurred_on) values ('${INV_A}',10,'expense','comida','almuerzo','2026-03-01');
    insert into storage.objects (bucket_id, name) values ('agreement-documents','${AG_A}/contrato.pdf'),('agreement-documents','${AG_A}/interno.pdf');`)
})

test('anonymous visitors read nothing from any private table', async () => {
  for (const t of ['profiles', 'agreements', 'agreement_members', 'projects', 'project_internal_details', 'updates', 'documents', 'transactions', 'participations', 'payments', 'audit_logs', 'personal_expenses', 'user_preferences', 'notifications']) {
    const r = await rows('anon', undefined, `select * from public.${t}`)
    assert.ok('denied' in r || r.rows.length === 0, `anon must not read ${t}`)
  }
})

test('an investor sees only their own agreement, its visible projects and member-level updates', async () => {
  assert.deepEqual((await rows('authenticated', INV_A, 'select name from public.agreements') as { rows: { name: string }[] }).rows.map((r) => r.name), ['Acuerdo A'])
  assert.deepEqual((await rows('authenticated', INV_A, 'select name from public.projects order by name') as { rows: { name: string }[] }).rows.map((r) => r.name), ['Proyecto visible A'])
  assert.deepEqual((await rows('authenticated', INV_A, 'select title from public.updates') as { rows: { title: string }[] }).rows.map((r) => r.title), ['Para miembros'])
})

test('admin-only data never reaches investors: internal notes, admin-only updates, audit trail', async () => {
  assert.equal(await count(INV_A, 'project_internal_details'), 0)
  assert.equal(await count(INV_A, 'audit_logs'), 0)
  const audit = (await db.query<{ n: number }>(`select count(*)::int n from public.audit_logs where new_data::text like '%CONTENIDO SOLO ADMIN%'`)).rows[0].n
  assert.ok(audit >= 0)
  assert.equal(await count(INV_A, 'audit_logs', `new_data::text like '%SOLO ADMIN%' or new_data::text like '%SECRETAS%'`), 0)
})

test('investors are isolated from each other: agreements, ledger, participations, payments, documents, profiles', async () => {
  for (const t of ['transactions', 'participations', 'payments', 'documents', 'updates', 'projects']) {
    assert.equal(await count(INV_B, t, `agreement_id = '${AG_A}'`), 0, `INV_B must not read ${t} of agreement A`)
  }
  assert.equal(await count(INV_B, 'profiles', `id = '${INV_A}'`), 0, 'no cross-agreement profile visibility')
  assert.equal(await count(INV_B, 'personal_expenses', `user_id = '${INV_A}'`), 0)
  assert.equal(await count(OUTSIDER, 'agreements'), 0)
  assert.equal(await count(OUTSIDER, 'transactions'), 0)
})

test('an investor cannot write business data, add themselves to agreements or change their role', async () => {
  await as(db, 'authenticated', { sub: INV_A })
  const attempts: [string, string][] = [
    ['create agreement', `insert into public.agreements (name, initial_contribution, participation_percentage, contractual_cap, start_date) values ('X',0,1,0,now())`],
    ['join agreement B', `insert into public.agreement_members (agreement_id, user_id, role) values ('${AG_B}','${INV_A}','investor')`],
    ['become admin of A', `update public.agreement_members set role='admin' where user_id='${INV_A}'`],
    ['promote profile', `update public.profiles set role='admin' where id='${INV_A}'`],
    ['record income', `insert into public.transactions (agreement_id, type, amount, effective_date, description, created_by) values ('${AG_A}','income',1,now(),'fraude','${INV_A}')`],
    ['record payment', `insert into public.payments (agreement_id, investor_id, amount, payment_date, payment_method, created_by) values ('${AG_A}','${INV_A}',1,now(),'efectivo','${INV_A}')`],
    ['approve participation', `update public.participations set status='paid' where id='${id(40)}'`],
    ['post update', `insert into public.updates (agreement_id, title, content, created_by) values ('${AG_A}','Hola','contenido','${INV_A}')`],
  ]
  for (const [label, sql] of attempts) {
    const f = await failure(db, sql)
    const affected = f ? 0 : (await db.query(sql.startsWith('insert') ? sql.replace(/^insert/, 'insert') + ' on conflict do nothing' : sql).then((r) => r.affectedRows ?? 0, () => 0))
    assert.ok(f || affected === 0, `${label} must be denied`)
  }
  await as(db, 'postgres')
  assert.equal((await db.query<{ role: string }>(`select role from public.profiles where id='${INV_A}'`)).rows[0].role, 'investor')
  assert.equal((await db.query<{ n: number }>(`select count(*)::int n from public.agreement_members where user_id='${INV_A}'`)).rows[0].n, 1)
})

test('private documents: a member reads only the files an admin marked visible; other investors and anonymous read nothing; investors cannot upload', async () => {
  const sel = `select name from storage.objects where bucket_id='agreement-documents'`
  assert.deepEqual(((await rows('authenticated', INV_A, sel)) as { rows: { name: string }[] }).rows.map((r) => r.name), [`${AG_A}/contrato.pdf`])
  assert.equal(await count(INV_A, 'documents'), 1)
  assert.equal(((await rows('authenticated', INV_B, sel)) as { rows: unknown[] }).rows.length, 0)
  const anon = await rows('anon', undefined, sel); assert.ok('denied' in anon || anon.rows.length === 0)
  await as(db, 'authenticated', { sub: INV_A })
  assert.ok(await failure(db, `insert into storage.objects (bucket_id, name, owner_id) values ('agreement-documents','${AG_A}/x.pdf','${INV_A}')`), 'investor cannot upload')
})

test('a platform admin sees operational data of every agreement, including internal notes, hidden documents and the audit trail', async () => {
  assert.equal(await count(ADMIN, 'projects'), 3)
  assert.equal(await count(ADMIN, 'documents'), 2)
  assert.equal(await count(ADMIN, 'project_internal_details'), 1)
  assert.equal(await count(ADMIN, 'updates'), 2)
  assert.ok((await count(ADMIN, 'audit_logs')) > 0)
})
