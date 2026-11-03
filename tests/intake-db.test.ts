// Database-level tests of the public intake (leads + testimonials + Storage): schema, validation, RLS, grants, moderation, anti-abuse.
// Runs on local Postgres (PGlite) with the real migrations. See tests/support/db.ts for what this does and does not prove.
import test, { before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { PGlite } from '@electric-sql/pglite'
import { makeDb, as, failure } from './support/db.ts'

let db: PGlite
const ADMIN = '00000000-0000-4000-8000-0000000000a1'
const INVESTOR = '00000000-0000-4000-8000-0000000000b1'
const ip = (n: number) => ({ 'cf-connecting-ip': `203.0.113.${n}` })

const lead = (o: Partial<Record<string, unknown>> = {}) => ({
  business_type: 'hotel', needs: ['sitio_nuevo'], budget: 'menos_500', timeline: 'asap',
  name: 'QA Brief', email: 'qa@example.com', whatsapp: null, message: null, source: 'brief', ...o,
})
const LEAD_SQL = `insert into public.leads (business_type, needs, budget, timeline, name, email, whatsapp, message, source) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
const leadArgs = (l: ReturnType<typeof lead>) => [l.business_type, l.needs, l.budget, l.timeline, l.name, l.email, l.whatsapp, l.message, l.source]
async function insertLead(o: Partial<Record<string, unknown>> = {}, headers: Record<string, string> = ip(1)) {
  await as(db, 'anon', { headers })
  return failure(db, LEAD_SQL, leadArgs(lead(o)))
}

const MSG = 'Reseña de prueba con más de veinte caracteres para la validación.'
const STORAGE = 'https://proj.supabase.co/storage/v1/object/public'
const TESTI_SQL = `insert into public.testimonials (name, company, role, message, rating, avatar_url, result_image_url, video_url, approved) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
const testi = (o: Partial<Record<string, unknown>> = {}) => ({ name: 'QA Reseña', company: null, role: null, message: MSG, rating: 5, avatar_url: null, result_image_url: null, video_url: null, approved: false, ...o })
const testiArgs = (t: ReturnType<typeof testi>) => [t.name, t.company, t.role, t.message, t.rating, t.avatar_url, t.result_image_url, t.video_url, t.approved]
async function insertTesti(o: Partial<Record<string, unknown>> = {}, headers: Record<string, string> = ip(1), role: 'anon' | 'authenticated' = 'anon') {
  await as(db, role, { headers, sub: role === 'authenticated' ? INVESTOR : undefined })
  return failure(db, TESTI_SQL, testiArgs(testi(o)))
}
const q = async (role: 'postgres' | 'anon' | 'authenticated', sql: string, sub?: string) => { await as(db, role, { sub }); return (await db.query<Record<string, unknown>>(sql)).rows }

before(async () => {
  db = await makeDb()
  await as(db, 'postgres')
  await db.exec(`insert into auth.users(id,email) values ('${ADMIN}','admin@deepsun.test'),('${INVESTOR}','inv@deepsun.test');
    alter table public.profiles disable trigger protect_profile_role_trigger;
    update public.profiles set role='admin' where id='${ADMIN}';
    alter table public.profiles enable trigger protect_profile_role_trigger;`)
})
beforeEach(async () => { await as(db, 'postgres'); await db.exec('truncate public.leads, public.testimonials') })

// ───────────────────────────────────────────────────────────── schema ──
test('tables, RLS and buckets exist and match the columns the frontend sends', async () => {
  const rows = await q('postgres', `select c.relname, c.relrowsecurity from pg_class c where c.relnamespace='public'::regnamespace and c.relname in ('leads','testimonials') order by 1`)
  assert.deepEqual(rows.map((r) => [r.relname, r.relrowsecurity]), [['leads', true], ['testimonials', true]])
  const b = await q('postgres', `select id, public, file_size_limit, allowed_mime_types from storage.buckets where id like 'testimonial-%' order by id`)
  assert.equal(b.length, 3)
  assert.deepEqual(b.map((x) => Number(x.file_size_limit)), [2097152, 5242880, 52428800])
})

test('migration is idempotent and refuses an existing table that drifted from the frontend schema', async () => {
  const again = await makeDb()
  const sql = (await import('node:fs')).readFileSync(new URL('../supabase/migrations/202611030001_public_intake.sql', import.meta.url), 'utf8')
  await as(again, 'postgres'); await again.exec(sql) // second run must not fail
  const drift = await makeDb({ only: ['202609290001_portal_core.sql', '202609290002_rls_storage_audit.sql'] })
  await drift.exec(`create table public.leads (id uuid primary key, created_at timestamptz default now(), name text, email text)`)
  const err = await failure(drift, sql.replace(/\n/g, '\n'))
  const res = await drift.exec(sql).then(() => null, (e: Error) => e.message)
  assert.match(String(res ?? err?.message), /schema differs/)
})

// ──────────────────────────────────────────────────────────── leads: insert ──
test('leads: both real form payloads are accepted by an anonymous visitor', async () => {
  assert.equal(await insertLead(), null)
  assert.equal(await insertLead({ business_type: 'otro', needs: ['asesoria'], budget: 'no_se', timeline: 'explorando', source: 'home_quick', message: '[Formulario rápido · portada] idea de prueba', email: 'b@example.com' }, ip(2)), null)
  await as(db, 'anon', { headers: ip(3) })
  assert.equal(await failure(db, `insert into public.leads (business_type, needs, budget, timeline, name, email) values ('hotel','{sitio_nuevo}','menos_500','asap','Sin source','c@example.com')`), null) // older frontend without `source`
})

test('leads: an anonymous visitor cannot read, edit or delete anything', async () => {
  await insertLead()
  await as(db, 'anon')
  assert.equal((await failure(db, 'select * from public.leads'))?.code, '42501')
  assert.equal((await failure(db, 'select id from public.leads'))?.code, '42501')
  assert.equal((await failure(db, `update public.leads set status='won'`))?.code, '42501')
  assert.equal((await failure(db, 'delete from public.leads'))?.code, '42501')
})

test('leads: server-controlled columns cannot be set by the client', async () => {
  await as(db, 'anon', { headers: ip(1) })
  for (const col of ['status', 'admin_notes', 'client_hash', 'handled_by', 'created_at', 'id']) {
    const f = await failure(db, `insert into public.leads (business_type, needs, budget, timeline, name, email, ${col}) values ('hotel','{asesoria}','no_se','asap','QA','x@example.com', null)`)
    assert.equal(f?.code, '42501', `${col} must not be insertable by anon`)
  }
})

test('leads: invalid values are rejected by the database (not only by the browser)', async () => {
  const bad: [string, Partial<Record<string, unknown>>][] = [
    ['business_type', { business_type: 'casino' }], ['budget', { budget: 'infinito' }], ['timeline', { timeline: 'ayer' }],
    ['needs unknown', { needs: ['hackear'] }], ['needs empty', { needs: [] }], ['name short', { name: 'A' }], ['email', { email: 'no-es-correo' }],
    ['whatsapp', { whatsapp: '<script>' }], ['message too long', { message: 'x'.repeat(2001) }], ['source', { source: 'api' }],
  ]
  for (const [label, o] of bad) { const f = await insertLead(o, ip(9)); assert.equal(f?.code, '23514', `${label} should violate a CHECK, got ${f?.message}`) }
})

test('leads: the stored row is normalised and carries only a hash of the client address', async () => {
  await insertLead({ email: '  QA@Example.COM ', name: '  Ana  ', message: '  hola  ' }, ip(7))
  const [r] = await q('postgres', 'select email, name, message, client_hash, status from public.leads')
  assert.equal(r.email, 'qa@example.com'); assert.equal(r.name, 'Ana'); assert.equal(r.message, 'hola'); assert.equal(r.status, 'new')
  assert.match(String(r.client_hash), /^[0-9a-f]{64}$/); assert.ok(!JSON.stringify(r).includes('203.0.113.7'))
})

// ───────────────────────────────────────────────────────── leads: anti-abuse ──
test('leads: an identical request within 24h is rejected as a duplicate (DS001)', async () => {
  assert.equal(await insertLead(), null)
  assert.equal((await insertLead(undefined, ip(4)))?.code, 'DS001')
  assert.equal(await insertLead({ message: 'otra consulta distinta' }, ip(4)), null)
})

test('leads: per-address limit — the 6th request in an hour from the same address is rejected (DS002); another address is fine', async () => {
  for (let i = 0; i < 5; i++) assert.equal(await insertLead({ email: `u${i}@example.com` }, ip(10)), null)
  assert.equal((await insertLead({ email: 'u5@example.com' }, ip(10)))?.code, 'DS002')
  assert.equal(await insertLead({ email: 'u6@example.com' }, ip(11)), null)
})

test('leads: per-email limit — the 4th request in 24h for one email is rejected even from different addresses (DS002)', async () => {
  for (let i = 0; i < 3; i++) assert.equal(await insertLead({ email: 'same@example.com', message: `m${i}` }, ip(20 + i)), null)
  assert.equal((await insertLead({ email: 'same@example.com', message: 'm3' }, ip(30)))?.code, 'DS002')
})

test('leads: a global circuit breaker pauses intake after a flood (DS003) and does not hide that rows were stored', async () => {
  await as(db, 'postgres')
  await db.exec(`insert into public.leads (business_type, needs, budget, timeline, name, email, client_hash) select 'hotel','{asesoria}','no_se','asap','Flood '||g, 'f'||g||'@example.com', 'h'||g from generate_series(1,200) g`)
  assert.equal((await insertLead({ email: 'real@example.com' }, ip(40)))?.code, 'DS003')
})

test('leads: without any client-address header the email and global limits still apply', async () => {
  for (let i = 0; i < 3; i++) assert.equal(await insertLead({ email: 'noip@example.com', message: `n${i}` }, {}), null)
  assert.equal((await insertLead({ email: 'noip@example.com', message: 'n3' }, {}))?.code, 'DS002')
})

// ──────────────────────────────────────────────────── leads: admin handling ──
test('leads: investors (authenticated, non-admin) see nothing and change nothing; a platform admin can triage', async () => {
  await insertLead()
  assert.equal((await q('authenticated', 'select id from public.leads', INVESTOR)).length, 0)
  await as(db, 'authenticated', { sub: INVESTOR })
  assert.equal((await db.query(`update public.leads set status='won'`)).affectedRows, 0)
  assert.equal((await db.query('delete from public.leads')).affectedRows, 0)
  assert.equal((await q('authenticated', 'select id from public.leads', ADMIN)).length, 1)
  await as(db, 'authenticated', { sub: ADMIN })
  assert.equal((await failure(db, `update public.leads set name='Hacked'`))?.code, '42501', 'content columns are not updatable')
  assert.equal((await db.query(`update public.leads set status='contacted', admin_notes='llamar el lunes'`)).affectedRows, 1)
  const [r] = await q('authenticated', 'select name, status, admin_notes, handled_by, handled_at from public.leads', ADMIN)
  assert.equal(r.status, 'contacted'); assert.equal(r.name, 'QA Brief'); assert.equal(r.handled_by, ADMIN); assert.ok(r.handled_at)
  assert.equal((await failure(db, `update public.leads set email='x@evil.test'`))?.code, '42501')
})

// ───────────────────────────────────────────────────────── testimonials ──
test('testimonials: the real frontend payload is accepted and stays hidden until approved', async () => {
  assert.equal(await insertTesti(), null)
  assert.equal((await q('anon', 'select id from public.testimonials')).length, 0)
  assert.equal((await q('authenticated', 'select id from public.testimonials', INVESTOR)).length, 0)
  const [r] = await q('postgres', 'select approved, featured from public.testimonials'); assert.deepEqual([r.approved, r.featured], [false, false])
})

test('testimonials: nobody can publish or feature their own submission', async () => {
  assert.equal(await insertTesti({ approved: true }), null) // accepted, but the guard trigger forces it back to unapproved
  assert.equal((await q('postgres', 'select approved from public.testimonials'))[0].approved, false)
  assert.equal((await q('anon', 'select id from public.testimonials')).length, 0, 'still invisible to the public')
  await as(db, 'anon', { headers: ip(1) })
  assert.equal((await failure(db, `insert into public.testimonials (name, message, rating, featured) values ('QA','${MSG}',5,true)`))?.code, '42501') // no grant on featured
  await as(db, 'postgres'); await db.exec('truncate public.testimonials')
  await insertTesti({}, ip(2))
  await as(db, 'anon')
  assert.equal((await failure(db, `update public.testimonials set approved=true`))?.code, '42501')
  await as(db, 'authenticated', { sub: INVESTOR })
  const u = await db.query(`update public.testimonials set approved=true`)
  assert.equal(u.affectedRows, 0)
  assert.equal((await q('postgres', `select count(*)::int n from public.testimonials where approved`))[0].n, 0)
})

test('testimonials: the public sees only approved rows and only the public columns', async () => {
  await insertTesti({ name: 'Pendiente' }, ip(1)); await insertTesti({ name: 'Aprobada', message: MSG + ' (2)' }, ip(2))
  await as(db, 'postgres'); await db.exec(`update public.testimonials set approved=true where name='Aprobada'`)
  const rows = await q('anon', 'select id, name, message, rating, approved, featured from public.testimonials')
  assert.deepEqual(rows.map((r) => r.name), ['Aprobada'])
  await as(db, 'anon')
  for (const col of ['client_hash', 'moderated_by']) assert.equal((await failure(db, `select ${col} from public.testimonials`))?.code, '42501')
  assert.equal((await failure(db, 'select * from public.testimonials'))?.code, '42501', 'select * is denied: the frontend must name its columns')
})

test('testimonials: only a platform admin moderates, content stays immutable, featured requires approved', async () => {
  await insertTesti()
  await as(db, 'authenticated', { sub: ADMIN })
  assert.equal((await db.query('select id from public.testimonials')).rows.length, 1)
  assert.equal((await db.query(`update public.testimonials set featured=true`)).affectedRows, 1) // trigger clears featured while not approved
  assert.equal((await db.query<{ featured: boolean }>('select featured from public.testimonials')).rows[0].featured, false)
  assert.equal((await db.query(`update public.testimonials set approved=true, featured=true`)).affectedRows, 1)
  const [r] = (await db.query<Record<string, unknown>>('select approved, featured, moderated_at, message from public.testimonials')).rows
  assert.deepEqual([r.approved, r.featured], [true, true]); assert.ok(r.moderated_at)
  assert.equal((await q('postgres', 'select moderated_by from public.testimonials'))[0].moderated_by, ADMIN)
  await as(db, 'authenticated', { sub: ADMIN })
  assert.equal((await failure(db, `update public.testimonials set message='editado'`))?.code, '42501')
  assert.equal((await q('anon', 'select id from public.testimonials')).length, 1)
})

test('testimonials: dashboard / SQL-editor connections (no API role) can still moderate', async () => {
  await insertTesti()
  await as(db, 'postgres')
  assert.equal((await db.query(`update public.testimonials set approved=true`)).affectedRows, 1)
})

test('testimonials: validation — rating, length and media URLs (only our own public buckets are accepted)', async () => {
  const ok = `${STORAGE}/testimonial-avatars/1700000000000-abc123def45.png`
  assert.equal(await insertTesti({ avatar_url: ok }, ip(50)), null)
  const bad: [string, Partial<Record<string, unknown>>][] = [
    ['rating 0', { rating: 0 }], ['rating 6', { rating: 6 }], ['short message', { message: 'corta' }], ['short name', { name: 'A' }],
    ['external avatar', { avatar_url: 'https://evil.example/pixel.png' }], ['javascript url', { avatar_url: 'javascript:alert(1)' }],
    ['avatar in results bucket', { avatar_url: `${STORAGE}/testimonial-results/1700000000000-abc123def45.png` }],
    ['video in avatars bucket', { video_url: `${STORAGE}/testimonial-avatars/1700000000000-abc123def45.mp4` }],
    ['path traversal', { result_image_url: `${STORAGE}/testimonial-results/../agreement-documents/x.png` }],
  ]
  for (const [label, o] of bad) { const f = await insertTesti({ ...o, message: (o.message as string) ?? MSG + label }, ip(51)); assert.equal(f?.code, '23514', `${label}: ${f?.message}`) }
})

test('testimonials: anti-abuse — duplicates, per-address and global limits', async () => {
  assert.equal(await insertTesti({}, ip(60)), null)
  assert.equal((await insertTesti({}, ip(61)))?.code, 'DS001')
  for (let i = 1; i < 3; i++) assert.equal(await insertTesti({ name: `Persona ${i}`, message: MSG + i }, ip(60)), null)
  assert.equal((await insertTesti({ name: 'Persona 4', message: MSG + 4 }, ip(60)))?.code, 'DS002')
  await as(db, 'postgres')
  await db.exec(`insert into public.testimonials (name, message, rating, client_hash) select 'Flood '||g, '${MSG} flood '||g, 5, 'h'||g from generate_series(1,60) g`)
  assert.equal((await insertTesti({ name: 'Real', message: MSG + ' real' }, ip(70)))?.code, 'DS003')
})

test('testimonials: the frontend must not chain .select() after insert (anonymous RETURNING is denied by RLS)', async () => {
  await as(db, 'anon', { headers: ip(1) })
  const f = await failure(db, `insert into public.testimonials (name, message, rating) values ('QA','${MSG}',5) returning id`)
  assert.ok(f, 'RETURNING for an unapproved row must fail for anon — the form uses return=minimal')
})

// ─────────────────────────────────────────────────────────────── Storage ──
test('storage: anonymous uploads are limited to the three buckets, by file-name pattern; nothing else is readable or writable', async () => {
  await as(db, 'anon')
  const put = (bucket: string, name: string) => failure(db, `insert into storage.objects (bucket_id, name) values ($1,$2)`, [bucket, name])
  assert.equal(await put('testimonial-avatars', '1700000000000-abc123def45.png'), null)
  assert.equal(await put('testimonial-results', '1700000000000-abc123def45.jpeg'), null)
  assert.equal(await put('testimonial-videos', '1700000000000-abc123def45.mp4'), null)
  assert.equal((await put('testimonial-videos', '1700000000000-abc123def45.png'))?.code, '42501')
  assert.equal((await put('testimonial-avatars', '1700000000000-abc123def45.exe'))?.code, '42501')
  assert.equal((await put('testimonial-avatars', '../agreement-documents/x.png'))?.code, '42501')
  assert.equal((await put('agreement-documents', '1700000000000-abc123def45.png'))?.code, '42501')
  assert.equal((await failure(db, 'select * from storage.objects'))?.code, '42501')
  assert.equal((await failure(db, `delete from storage.objects`))?.code, '42501')
})

// ───────────────────────────────────────────── portal regression (existing) ──
test('portal: existing private tables keep denying anonymous access and role escalation', async () => {
  await as(db, 'anon')
  for (const t of ['profiles', 'agreements', 'agreement_members', 'documents', 'transactions', 'payments', 'audit_logs']) {
    const f = await failure(db, `select * from public.${t}`)
    const rows = f ? null : (await db.query(`select * from public.${t}`)).rows
    assert.ok(f || rows?.length === 0, `anon must not read ${t}`)
  }
  await as(db, 'authenticated', { sub: INVESTOR })
  const f = await failure(db, `update public.profiles set role='admin' where id='${INVESTOR}'`)
  assert.ok(f, 'an investor must not promote themselves')
  assert.equal((await q('postgres', `select role from public.profiles where id='${INVESTOR}'`))[0].role, 'investor')
  await as(db, 'authenticated', { sub: INVESTOR })
  assert.equal((await db.query(`insert into public.agreements (name, initial_contribution, participation_percentage, contractual_cap, start_date) values ('Acuerdo X',0,10,0,now())`).then(() => 'inserted', () => 'denied')), 'denied')
})

// ─────────────────────────────────── upgrading a permissive, hand-made setup ──
test('upgrade: the migration closes a legacy dashboard-made setup (RLS off / open policies) without losing rows', async () => {
  const fs = await import('node:fs')
  const sql = fs.readFileSync(new URL('../supabase/migrations/202611030001_public_intake.sql', import.meta.url), 'utf8')
  const legacy = await makeDb({ only: ['202609290001_portal_core.sql', '202609290002_rls_storage_audit.sql'] })
  await legacy.exec(`
    create table public.leads (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), business_type text, needs text[], budget text, timeline text, name text, email text, whatsapp text, message text);
    create table public.testimonials (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), name text, company text, role text, message text, rating int, avatar_url text, result_image_url text, video_url text, approved boolean default false, featured boolean default false);
    alter table public.testimonials enable row level security;
    create policy "anyone can do anything" on public.testimonials for all to public using (true) with check (true);
    insert into public.leads (business_type, needs, budget, timeline, name, email) values ('hotel','{sitio_nuevo}','no_se','asap','Cliente previo','previo@example.com');
    insert into public.testimonials (name, message, rating, approved) values ('Previa','${MSG}',5,false);`) // leads has RLS OFF; testimonials has an open policy
  await as(legacy, 'anon')
  assert.equal((await legacy.query('select * from public.leads')).rows.length, 1, 'BEFORE: anonymous can read every lead')
  assert.equal((await legacy.query(`update public.testimonials set approved=true`)).affectedRows, 1, 'BEFORE: anonymous can self-approve')
  await as(legacy, 'postgres')
  await legacy.exec(sql)
  await as(legacy, 'anon')
  assert.equal((await failure(legacy, 'select * from public.leads'))?.code, '42501', 'AFTER: leads closed')
  assert.equal((await failure(legacy, `update public.testimonials set approved=true`))?.code, '42501', 'AFTER: self-approval impossible')
  await as(legacy, 'postgres')
  assert.equal((await legacy.query('select * from public.leads')).rows.length, 1, 'existing rows preserved')
  assert.equal((await legacy.query<{ n: number }>(`select count(*)::int n from pg_policies where tablename='testimonials' and policyname='anyone can do anything'`)).rows[0].n, 0)
})

// ─────────────────────────────── contract: columns the code really queries ──
test('contract: the exact column lists used by the public carousel and the admin screens are permitted by the grants', async () => {
  const fs = await import('node:fs')
  const read = (p: string) => fs.readFileSync(new URL(p, import.meta.url), 'utf8')
  const publicCols = /\.select\('([a-z_,]+)'\)\s*\n\s*\.eq\('approved', true\)/.exec(read('../components/site/Reviews.tsx'))?.[1]
  const leadCols = /LEAD_COLUMNS = '([a-z_,]+)'/.exec(read('../lib/portal/intake.ts'))?.[1]
  const testiCols = /TESTIMONIAL_COLUMNS = '([a-z_,]+)'/.exec(read('../lib/portal/intake.ts'))?.[1]
  assert.ok(publicCols && leadCols && testiCols, 'column lists must be found in the source')
  await insertTesti(); await insertLead()
  await as(db, 'postgres'); await db.exec(`update public.testimonials set approved=true`)
  await as(db, 'anon'); assert.equal((await failure(db, `select ${publicCols} from public.testimonials where approved = true`)), null)
  await as(db, 'authenticated', { sub: ADMIN })
  assert.equal(await failure(db, `select ${leadCols} from public.leads`), null)
  assert.equal(await failure(db, `select ${testiCols} from public.testimonials`), null)
  // and every column the two public forms insert is insertable by anon (payload keys taken from the source)
  const leadKeys = ['business_type', 'needs', 'budget', 'timeline', 'name', 'email', 'whatsapp', 'message', 'source']
  const g = await q('postgres', `select column_name from information_schema.column_privileges where table_name='leads' and grantee='anon' and privilege_type='INSERT'`)
  for (const k of leadKeys) assert.ok(g.some((r) => r.column_name === k), `anon must be able to insert leads.${k}`)
})
