// Seeds a HOSTED STAGING Supabase project with fictitious accounts. Never production: it refuses the production ref and needs explicit confirmation.
//   HOSTED_URL=https://<staging-ref>.supabase.co HOSTED_CONFIRM=<staging-ref> HOSTED_SERVICE_ROLE_KEY=<staging service_role> \
//   node scripts/staging/seed-hosted.mjs <out-dir>        (out-dir OUTSIDE the repository)
// Step 1 (this script): creates the 5 synthetic users through the Auth admin API with random passwords, writes <out-dir>/seed.json (credentials, keep private)
//   and <out-dir>/seed-hosted.sql. The service_role key is read from the environment, never printed, never written to disk.
// Step 2 (you): paste <out-dir>/seed-hosted.sql into the STAGING project's SQL Editor (promoting the first platform admin needs the profile-role
//   trigger switched off for one transaction, which the API cannot do — same as supabase/seed.sql in production).
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const PRODUCTION_REF = 'svbvkgvtjksvjfvigiah'
const URL_ = (process.env.HOSTED_URL ?? '').replace(/\/+$/, '')
const SERVICE = process.env.HOSTED_SERVICE_ROLE_KEY ?? ''
const ref = /^https:\/\/([a-z0-9]+)\.supabase\.co$/.exec(URL_)?.[1]
const outDir = process.argv[2]
const die = (m) => { console.error('ABORTED: ' + m); process.exit(2) }
if (!ref || !SERVICE || !outDir) die('set HOSTED_URL (https://<ref>.supabase.co), HOSTED_SERVICE_ROLE_KEY and pass an output directory')
if (ref === PRODUCTION_REF || URL_.includes(PRODUCTION_REF)) die('that is the PRODUCTION project')
if (process.env.HOSTED_CONFIRM !== ref) die(`set HOSTED_CONFIRM=${ref} to confirm this is the staging project`)
if (path.resolve(outDir).toLowerCase().includes('portafolio')) die('write the output OUTSIDE the repository (it contains credentials)')
fs.mkdirSync(outDir, { recursive: true })

const people = { admin: 'Admin Ficticia', adminA: 'Admin Acuerdo A', invA: 'Inversionista A', invB: 'Inversionista B', outsider: 'Externo Ficticio' }
const password = crypto.randomBytes(18).toString('base64url') + 'aA1!'
const users = {}
for (const [key, full_name] of Object.entries(people)) {
  const email = `${key.toLowerCase()}@example.test`
  const r = await fetch(`${URL_}/auth/v1/admin/users`, { method: 'POST', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } }) })
  const j = await r.json()
  if (!r.ok) die(`creating ${email}: ${r.status} ${j?.msg ?? j?.message ?? ''} (if it already exists, delete the synthetic users in the staging Auth panel and retry)`)
  users[key] = { id: j.id, email }
}
const u = (k) => users[k].id
const AG_A = '00000000-0000-4000-8000-00000000a001', AG_B = '00000000-0000-4000-8000-00000000b001'
const sql = `-- STAGING ONLY. Synthetic data. Paste into the STAGING project's SQL Editor (project ref ${ref}). Do NOT run it anywhere else.
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
commit;
`
fs.writeFileSync(path.join(outDir, 'seed-hosted.sql'), sql)
fs.writeFileSync(path.join(outDir, 'seed.json'), JSON.stringify({ password, users, agreements: { A: AG_A, B: AG_B } }))
console.log(`Created 5 synthetic users in ${ref}. Now paste ${path.join(outDir, 'seed-hosted.sql')} into the staging SQL Editor, then run the suites with STAGING_SEED_JSON=${path.join(outDir, 'seed.json')}.`)
