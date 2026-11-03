// Seeds a LOCAL Supabase stack (supabase start) with fictitious users, agreements, projects and documents for staging tests.
//   LOCAL_API_URL=http://127.0.0.1:56421 LOCAL_SERVICE_ROLE_KEY=<from `supabase status`> LOCAL_DB_CONTAINER=supabase_db_deepsun-staging node scripts/staging/seed-local.mjs
// Refuses anything that is not localhost. Everything is synthetic (@example.test). Writes ids/credentials to stdout as JSON.
import { spawnSync } from 'node:child_process'

const API = (process.env.LOCAL_API_URL ?? '').replace(/\/+$/, '')
const SERVICE = process.env.LOCAL_SERVICE_ROLE_KEY ?? ''
const DB = process.env.LOCAL_DB_CONTAINER ?? ''
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(API)) { console.error('ABORTED: LOCAL_API_URL must be http://127.0.0.1:<port> — this script never touches a hosted project'); process.exit(2) }
if (!SERVICE || !DB) { console.error('ABORTED: set LOCAL_SERVICE_ROLE_KEY and LOCAL_DB_CONTAINER'); process.exit(2) }

const PASSWORD = 'Staging-Local-Only-1!'
const people = { admin: 'Admin Ficticia', adminA: 'Admin Acuerdo A', invA: 'Inversionista A', invB: 'Inversionista B', outsider: 'Externo Ficticio' }
const ids = {}
for (const [key, full_name] of Object.entries(people)) {
  const email = `${key.toLowerCase()}@example.test`
  const r = await fetch(`${API}/auth/v1/admin/users`, { method: 'POST', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD, email_confirm: true, user_metadata: { full_name } }) })
  const j = await r.json()
  if (!r.ok) { console.error(`ABORTED: creating ${email}: ${r.status} ${JSON.stringify(j)}`); process.exit(1) }
  ids[key] = { id: j.id, email }
}
const u = (k) => ids[k].id
const AG_A = '00000000-0000-4000-8000-00000000a001', AG_B = '00000000-0000-4000-8000-00000000b001'
const sql = `
begin;
alter table public.profiles disable trigger protect_profile_role_trigger;
update public.profiles set role='admin' where id='${u('admin')}';
alter table public.profiles enable trigger protect_profile_role_trigger;
insert into public.agreements (id, name, initial_contribution, participation_percentage, contractual_cap, start_date) values
  ('${AG_A}','[staging] Acuerdo A',1000,10,5000,'2026-01-01'),('${AG_B}','[staging] Acuerdo B',2000,20,9000,'2026-01-01');
insert into public.agreement_members (agreement_id, user_id, role) values
  ('${AG_A}','${u('adminA')}','admin'),('${AG_A}','${u('invA')}','investor'),('${AG_B}','${u('invB')}','investor');
insert into public.projects (id, agreement_id, name, slug, public_name, investor_visible, status) values
  ('00000000-0000-4000-8000-00000000a010','${AG_A}','Proyecto visible A','visible-a','Proyecto visible A',true,'active'),
  ('00000000-0000-4000-8000-00000000a011','${AG_A}','Proyecto interno A','interno-a','Proyecto interno A',false,'active'),
  ('00000000-0000-4000-8000-00000000b010','${AG_B}','Proyecto B','proyecto-b','Proyecto B',true,'active');
commit;`
const run = spawnSync('docker', ['exec', '-i', DB, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-q'], { input: sql, encoding: 'utf8' })
if (run.status !== 0) { console.error('ABORTED: seeding SQL failed:\n' + run.stderr); process.exit(1) }
console.log(JSON.stringify({ password: PASSWORD, users: ids, agreements: { A: AG_A, B: AG_B } }))
