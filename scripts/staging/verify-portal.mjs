// Black-box verification of the PRIVATE PORTAL (Auth + PostgREST + Storage, real sessions) against a staging stack seeded by seed-local.mjs.
//   STAGING_SUPABASE_URL=http://127.0.0.1:56421 STAGING_CONFIRM=56421 STAGING_ANON_KEY=<publishable> STAGING_SEED_JSON=<seed-local output> node scripts/staging/verify-portal.mjs
// Same safety rules as verify.mjs: refuses the URL configured for the site, only uses the synthetic accounts, never prints personal data.
import fs from 'node:fs'

const URL_ = (process.env.STAGING_SUPABASE_URL ?? '').replace(/\/+$/, '')
const KEY = process.env.STAGING_ANON_KEY ?? ''
const ref = /^https:\/\/([a-z0-9]+)\.supabase\.co$/.exec(URL_)?.[1] ?? /^http:\/\/(?:127\.0\.0\.1|localhost):(\d+)$/.exec(URL_)?.[1]
const die = (m) => { console.error('ABORTED: ' + m); process.exit(2) }
if (!ref || !KEY || !process.env.STAGING_SEED_JSON) die('set STAGING_SUPABASE_URL, STAGING_ANON_KEY and STAGING_SEED_JSON')
if (process.env.STAGING_CONFIRM !== ref) die(`set STAGING_CONFIRM=${ref}`)
if (URL_.includes('svbvkgvtjksvjfvigiah') || (process.env.APP_URL ?? '').includes('svbvkgvtjksvjfvigiah')) die('this is the PRODUCTION project (svbvkgvtjksvjfvigiah): staging suites never run against it')
const known = new Set()
try { for (const m of fs.readFileSync('.env.local', 'utf8').matchAll(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(\S+)/g)) known.add(m[1].replace(/\/+$/, '')) } catch {}
if (process.env.NEXT_PUBLIC_SUPABASE_URL) known.add(process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, ''))
if (known.has(URL_)) die("this is the site's own Supabase URL (possibly production)")
const seed = JSON.parse(fs.readFileSync(process.env.STAGING_SEED_JSON, 'utf8'))
const { A: AG_A, B: AG_B } = seed.agreements
const P_A = '00000000-0000-4000-8000-00000000a010', P_A_HIDDEN = '00000000-0000-4000-8000-00000000a011', P_B = '00000000-0000-4000-8000-00000000b010'

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + detail}`) }
const hdr = (token, extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${token ?? KEY}`, 'Content-Type': 'application/json', ...extra })
const rest = async (path, { method = 'GET', token, body, prefer = 'return=representation' } = {}) => {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers: hdr(token, { Prefer: prefer }), body: body === undefined ? undefined : JSON.stringify(body) })
  let json = null; try { json = await r.json() } catch {}
  return { status: r.status, ok: r.ok, json, code: json?.code, message: json?.message }
}
const rows = (r) => (Array.isArray(r.json) ? r.json : [])
async function login(key) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: seed.users[key].email, password: seed.password }) })
  return r.ok ? (await r.json()).access_token : null
}
const upload = (token, bucket, path, type, bytes) => fetch(`${URL_}/storage/v1/object/${bucket}/${path}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': type }, body: bytes })
async function sign(token, bucket, path) {
  const r = await fetch(`${URL_}/storage/v1/object/sign/${bucket}/${path}`, { method: 'POST', headers: hdr(token), body: JSON.stringify({ expiresIn: 60 }) })
  if (!r.ok) return { ok: false, status: r.status }
  const { signedURL } = await r.json()
  const f = await fetch(`${URL_}/storage/v1${signedURL}`)
  return { ok: f.ok, status: f.status, bytes: f.ok ? new TextDecoder().decode(await f.arrayBuffer()) : null }
}

// ── authentication ────────────────────────────────────────────────────────────
const t = {}
for (const k of ['admin', 'adminA', 'invA', 'invB', 'outsider']) t[k] = await login(k)
check('all five synthetic accounts can sign in', Object.values(t).every(Boolean), JSON.stringify(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, !!v]))))
const bad = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: seed.users.invA.email, password: 'wrong-password' }) })
check('a wrong password is refused (400)', bad.status === 400, `status ${bad.status}`)
const signup = await fetch(`${URL_}/auth/v1/signup`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `signup-${Date.now()}@example.test`, password: 'Staging-Local-Only-1!' }) })
console.log(`INFO  public sign-up is ${signup.ok ? 'OPEN on this stack (local default). In PRODUCTION it must be OFF: Authentication → Sign In / Providers → "Allow new users to sign up"' : 'closed'}`)

// ── anonymous: nothing of the portal is reachable ────────────────────────────
for (const tbl of ['profiles', 'agreements', 'projects', 'documents', 'transactions', 'payments', 'audit_logs']) {
  const r = await rest(`${tbl}?select=*&limit=1`)
  check(`anon cannot read ${tbl}`, !r.ok || rows(r).length === 0, `status ${r.status}, rows ${rows(r).length}`)
}
// PostgREST resolves a function by its exact argument names, so each call carries exactly the arguments of its signature
// (a wrong shape would answer 404 and prove nothing).
const rpcArgs = {
  is_platform_admin: { p_user_id: seed.users.admin.id },
  is_agreement_admin: { p_agreement_id: AG_A, p_user_id: seed.users.admin.id },
  is_agreement_member: { p_agreement_id: AG_A, p_user_id: seed.users.invA.id },
  project_accepts_financials: { p_project_id: P_A },
  calculate_project_participation: { p_project_id: P_A, p_investor_id: seed.users.invA.id, p_reason: 'x' },
}
for (const [fn, body] of Object.entries(rpcArgs)) {
  const r = await rest(`rpc/${fn}`, { method: 'POST', body })
  check(`anon cannot call rpc/${fn} (permission denied, not "function not found")`, (r.status === 401 || r.status === 403) && r.code !== 'PGRST202', `status ${r.status} ${r.code} ${r.message ?? ''}`)
}

// ── RPC oracle closed for signed-in users ────────────────────────────────────
let r = await rest('rpc/is_platform_admin', { method: 'POST', token: t.invB, body: { p_user_id: seed.users.admin.id } })
check('a signed-in investor asking "is that user a platform admin?" always gets false', r.ok && r.json === false, `status ${r.status} ${JSON.stringify(r.json)}`)
r = await rest('rpc/is_platform_admin', { method: 'POST', token: t.admin, body: {} })
check('a platform admin asking about themselves gets true', r.ok && r.json === true, `status ${r.status} ${JSON.stringify(r.json)}`)
r = await rest('rpc/is_agreement_member', { method: 'POST', token: t.invB, body: { p_agreement_id: AG_A, p_user_id: seed.users.invA.id } })
check("an investor cannot probe another agreement's membership", r.ok && r.json === false, `status ${r.status} ${JSON.stringify(r.json)}`)

// ── RLS with real sessions ───────────────────────────────────────────────────
r = await rest('agreements?select=name', { token: t.invA }); check('investor A sees only agreement A', rows(r).length === 1 && rows(r)[0].name.includes('A'), JSON.stringify(rows(r)))
r = await rest('projects?select=id', { token: t.invA }); check('investor A sees only the visible project of A', rows(r).length === 1 && rows(r)[0].id === P_A, JSON.stringify(rows(r)))
r = await rest('agreements?select=name', { token: t.invB }); check('investor B sees only agreement B', rows(r).length === 1 && rows(r)[0].name.includes('B'), JSON.stringify(rows(r)))
r = await rest('agreements?select=id', { token: t.outsider }); check('a user in no agreement sees nothing', r.ok && rows(r).length === 0, `status ${r.status}`)
r = await rest('projects?select=id', { token: t.admin }); check('platform admin sees all three projects', rows(r).length === 3, `${rows(r).length}`)
r = await rest('agreement_members', { method: 'POST', token: t.invA, body: { agreement_id: AG_B, user_id: seed.users.invA.id, role: 'investor' }, prefer: 'return=minimal' })
check('an investor cannot join another agreement', !r.ok, `status ${r.status}`)
r = await rest(`profiles?id=eq.${seed.users.invA.id}`, { method: 'PATCH', token: t.invA, body: { role: 'admin' }, prefer: 'return=minimal' })
const prof = await rest(`profiles?select=role&id=eq.${seed.users.invA.id}`, { token: t.invA })
check('an investor cannot promote themselves to admin', !r.ok || rows(prof)[0]?.role === 'investor', `status ${r.status} role ${rows(prof)[0]?.role}`)

// ── ledger integrity + participation RPC (agreement admin) ───────────────────
const tx = (project_id) => ({ agreement_id: AG_A, project_id, type: 'income', amount: 1000, effective_date: '2026-02-01', status: 'confirmed', description: '[staging-test] ingreso', created_by: seed.users.adminA.id })
r = await rest('transactions', { method: 'POST', token: t.adminA, body: tx(P_B), prefer: 'return=minimal' })
check('an admin of A cannot write ledger rows into a project of B (project_agreement_mismatch)', !r.ok && /project_agreement_mismatch/.test(r.message ?? ''), `status ${r.status} ${r.message}`)
r = await rest('transactions', { method: 'POST', token: t.adminA, body: tx(P_A), prefer: 'return=minimal' })
check('an admin of A records income in its own project', r.status === 201, `status ${r.status} ${r.message}`)
r = await rest('rpc/calculate_project_participation', { method: 'POST', token: t.adminA, body: { p_project_id: P_A, p_investor_id: seed.users.invA.id, p_reason: '[staging-test]' } })
check('agreement admin runs calculate_project_participation', r.ok && typeof r.json === 'string', `status ${r.status} ${r.message}`)
r = await rest('rpc/calculate_project_participation', { method: 'POST', token: t.invA, body: { p_project_id: P_A, p_investor_id: seed.users.invA.id, p_reason: 'x' } })
check('an investor cannot run it ("Not authorized")', !r.ok && /Not authorized/.test(r.message ?? ''), `status ${r.status} ${r.message}`)
r = await rest('participations?select=amount', { token: t.invA }); check('investor A sees the calculated participation', rows(r).length >= 1, `${rows(r).length}`)
r = await rest('participations?select=amount', { token: t.invB }); check('investor B does not', rows(r).length === 0, `${rows(r).length}`)

// ── private documents through the REAL Storage API ───────────────────────────
const f = (agreement, name) => `${agreement}/contracts/${crypto.randomUUID()}-${name}`
const docRow = (token, uploaded_by, o) => rest('documents', { method: 'POST', token, prefer: 'return=minimal', body: { type: 'contract', mime_type: 'application/pdf', size: 12, uploaded_by, ...o } })
const visiblePath = f(AG_A, 'visible.pdf'), privatePath = f(AG_A, 'privado.pdf'), hiddenProjPath = f(AG_A, 'proyecto-oculto.pdf'), bPath = f(AG_B, 'secreto-de-B.pdf')
const BYTES = (s) => new TextEncoder().encode(s)
check('admin of A uploads into its own folder', (await upload(t.adminA, 'agreement-documents', visiblePath, 'application/pdf', BYTES('VISIBLE-A'))).ok)
check('admin of A uploads a private file', (await upload(t.adminA, 'agreement-documents', privatePath, 'application/pdf', BYTES('PRIVADO-A'))).ok)
check('admin of A uploads a file linked to a hidden project', (await upload(t.adminA, 'agreement-documents', hiddenProjPath, 'application/pdf', BYTES('OCULTO-A'))).ok)
check('platform admin uploads the secret file of agreement B', (await upload(t.admin, 'agreement-documents', bPath, 'application/pdf', BYTES('SECRETO-B'))).ok)
const cross = await upload(t.adminA, 'agreement-documents', f(AG_B, 'intruso.pdf'), 'application/pdf', BYTES('x'))
check('an admin of A cannot upload into the folder of B', !cross.ok, `status ${cross.status}`)
const wrongType = await upload(t.adminA, 'agreement-documents', f(AG_A, 'virus.exe'), 'application/x-msdownload', BYTES('x'))
check('a disallowed file type is refused by the bucket', !wrongType.ok, `status ${wrongType.status}`)
check('document row: visible', (await docRow(t.adminA, seed.users.adminA.id, { agreement_id: AG_A, name: 'visible.pdf', storage_path: visiblePath, investor_visible: true })).status === 201)
check('document row: private', (await docRow(t.adminA, seed.users.adminA.id, { agreement_id: AG_A, name: 'privado.pdf', storage_path: privatePath, investor_visible: false })).status === 201)
check('document row: visible but its project is hidden', (await docRow(t.adminA, seed.users.adminA.id, { agreement_id: AG_A, project_id: P_A_HIDDEN, name: 'proyecto-oculto.pdf', storage_path: hiddenProjPath, investor_visible: true })).status === 201)
// the old defect: a display name equal to the storage path, and a foreign path written into a row of agreement A
check('document row: the trap (name = storage_path, pointing at the file of B)', (await docRow(t.adminA, seed.users.adminA.id, { agreement_id: AG_A, name: bPath, storage_path: bPath, investor_visible: true })).status === 201)

let s = await sign(t.invA, 'agreement-documents', visiblePath)
check('investor A downloads the visible document and gets the right bytes', s.ok && s.bytes === 'VISIBLE-A', `status ${s.status}`)
s = await sign(t.invA, 'agreement-documents', privatePath); check('investor A cannot sign the private document', !s.ok, `status ${s.status}`)
s = await sign(t.invA, 'agreement-documents', hiddenProjPath); check('investor A cannot sign a document of a hidden project', !s.ok, `status ${s.status}`)
s = await sign(t.invA, 'agreement-documents', bPath); check('investor A cannot sign the file of agreement B, even with a documents row that points at it', !s.ok, `status ${s.status}`)
s = await sign(t.invB, 'agreement-documents', visiblePath); check('investor B cannot sign the visible document of A', !s.ok, `status ${s.status}`)
s = await sign(t.outsider, 'agreement-documents', visiblePath); check('a user in no agreement cannot sign it', !s.ok, `status ${s.status}`)
s = await sign(t.adminA, 'agreement-documents', privatePath); check('admin of A can sign the private document of its own agreement', s.ok && s.bytes === 'PRIVADO-A', `status ${s.status}`)
s = await sign(t.adminA, 'agreement-documents', bPath); check('admin of A cannot sign files of agreement B', !s.ok, `status ${s.status}`)
s = await sign(t.admin, 'agreement-documents', bPath); check('platform admin can sign any file', s.ok && s.bytes === 'SECRETO-B', `status ${s.status}`)
const list = await fetch(`${URL_}/storage/v1/object/list/agreement-documents`, { method: 'POST', headers: hdr(t.invA), body: JSON.stringify({ prefix: '', limit: 100 }) })
const listed = list.ok ? await list.json() : []
check("investor A cannot list other agreements' folders", Array.isArray(listed) && !JSON.stringify(listed).includes(AG_B), `status ${list.status}`)
const anonSign = await sign(null, 'agreement-documents', visiblePath); check('anonymous cannot sign anything', !anonSign.ok, `status ${anonSign.status}`)
const pub = await fetch(`${URL_}/storage/v1/object/public/agreement-documents/${visiblePath}`); check('the private bucket is not publicly readable', !pub.ok, `status ${pub.status}`)

const failed = results.filter((x) => !x.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed.${failed.length ? ' FAILED: ' + failed.map((x) => x.name).join('; ') : ''}`)
process.exit(failed.length ? 1 : 0)
