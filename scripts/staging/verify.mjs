// Black-box verification of the public intake against a STAGING Supabase project (never production).
//   node scripts/staging/verify.mjs
// Required env (set them in your shell, not in a committed file):
//   STAGING_SUPABASE_URL        https://<ref>.supabase.co
//   STAGING_ANON_KEY            the project's publishable/anon key
//   STAGING_CONFIRM             must equal the project ref (the part before .supabase.co) — proves you meant this project
// Optional (staging accounts you created; enables the role tests):
//   STAGING_ADMIN_EMAIL / STAGING_ADMIN_PASSWORD         platform admin
//   STAGING_INVESTOR_EMAIL / STAGING_INVESTOR_PASSWORD   investor (non-admin)
// Safety: refuses to run unless STAGING_CONFIRM matches the URL, refuses the URL found in .env.local / NEXT_PUBLIC_SUPABASE_URL
// (that is the site's own project, possibly production), only sends synthetic data (@example.test), and never reads personal data
// (it counts rows, it does not print them). It writes rows to staging: they are marked "[staging-test]" and can be deleted afterwards.
import fs from 'node:fs'

const URL_ = (process.env.STAGING_SUPABASE_URL ?? '').replace(/\/+$/, '')
const KEY = process.env.STAGING_ANON_KEY ?? ''
// Hosted staging: https://<ref>.supabase.co  (STAGING_CONFIRM = ref).  Local stack (supabase start): http://127.0.0.1:<port>  (STAGING_CONFIRM = port).
const ref = /^https:\/\/([a-z0-9]+)\.supabase\.co$/.exec(URL_)?.[1] ?? /^http:\/\/(?:127\.0\.0\.1|localhost):(\d+)$/.exec(URL_)?.[1]
const die = (m) => { console.error('ABORTED: ' + m); process.exit(2) }

if (!ref || !KEY) die('set STAGING_SUPABASE_URL (https://<ref>.supabase.co or http://127.0.0.1:<port>) and STAGING_ANON_KEY')
if (process.env.STAGING_CONFIRM !== ref) die(`set STAGING_CONFIRM=${ref} to confirm this is the staging project`)
if (URL_.includes('svbvkgvtjksvjfvigiah') || (process.env.APP_URL ?? '').includes('svbvkgvtjksvjfvigiah')) die('this is the PRODUCTION project (svbvkgvtjksvjfvigiah): staging suites never run against it')
const known = new Set()
try { for (const m of fs.readFileSync('.env.local', 'utf8').matchAll(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(\S+)/g)) known.add(m[1].replace(/\/+$/, '')) } catch {}
if (process.env.NEXT_PUBLIC_SUPABASE_URL) known.add(process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, ''))
if (known.has(URL_)) die('this URL is the one configured for the site (.env.local / NEXT_PUBLIC_SUPABASE_URL), which may be production. Use a separate staging project.')

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + detail}`) }
const H = (token, extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${token ?? KEY}`, 'Content-Type': 'application/json', ...extra })
const rest = (path, { method = 'GET', token, body, headers } = {}) =>
  fetch(`${URL_}/rest/v1/${path}`, { method, headers: H(token, { Prefer: 'return=minimal', ...headers }), body: body ? JSON.stringify(body) : undefined })
const code = async (r) => { try { return (await r.clone().json())?.code } catch { return undefined } }

async function login(email, password) {
  if (!email || !password) return null
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  return r.ok ? (await r.json()).access_token : null
}

const stamp = Date.now()
const lead = (o = {}) => ({ business_type: 'hotel', needs: ['sitio_nuevo'], budget: 'no_se', timeline: 'explorando', name: '[staging-test] Ficticio', email: `staging-${stamp}@example.test`, whatsapp: null, message: `prueba ${stamp}`, source: 'brief', ...o })
const MSG = 'Reseña ficticia de prueba en staging con más de veinte caracteres.'

// ── anonymous visitor ─────────────────────────────────────────────────────────
let r = await rest('leads?select=id&limit=1')
const body = r.ok ? await r.json() : []
check('anon cannot read leads', !r.ok || body.length === 0, `status ${r.status}, rows ${body.length}`)
r = await rest('leads?name=eq.x', { method: 'DELETE' }); check('anon cannot delete leads', !r.ok, `status ${r.status}`)
r = await rest('leads', { method: 'POST', body: lead() }); check('anon can submit a lead (201)', r.status === 201, `status ${r.status}`)
r = await rest('leads', { method: 'POST', body: lead() }); check('identical lead → DS001', r.status >= 400 && (await code(r)) === 'DS001', `status ${r.status} code ${await code(r)}`)
r = await rest('leads', { method: 'POST', body: lead({ email: `bad-${stamp}@example.test`, business_type: 'casino' }) }); check('invalid value rejected (CHECK)', r.status === 400 || r.status === 409, `status ${r.status}`)
r = await rest('leads', { method: 'POST', body: lead({ email: `st-${stamp}@example.test`, status: 'won' }) }); check('anon cannot set status', r.status >= 400, `status ${r.status}`)

// Per-address limit. (a) The browser-supplied X-Forwarded-For must NOT be what limits (it is ignored by design): informational.
let sawLimitXff = false
for (let i = 0; i < 7; i++) {
  const x = await rest('leads', { method: 'POST', body: lead({ email: `xff-${stamp}-${i}@example.test`, message: `xff ${i}` }), headers: { 'X-Forwarded-For': `198.51.100.${i + 1}` } })
  if ((await code(x)) === 'DS002') sawLimitXff = true
}
console.log(`INFO  rotating X-Forwarded-For ${sawLimitXff ? 'was limited (an edge proxy overwrote it, or xff_from_right is set)' : 'is ignored, as designed (no bypass and no limit from that header)'}`)
// (b) The trusted platform header (intake_settings.trusted_ip_header, default cf-connecting-ip) DOES limit: proves the mechanism.
//     On hosted Supabase that header is set by Cloudflare and cannot be forged by the visitor; on a local stack anybody can send it.
//     Whether the REAL header reaches the database can only be confirmed on a hosted project: see docs/LANZAMIENTO.md.
//     HOSTED (Cloudflare in front): a client-sent cf-connecting-ip is rejected at the edge (403), so it cannot be forged, and the REAL address
//     is injected by the edge: sending WITHOUT the header must hit the per-IP limit. LOCAL stack (no edge): the client-sent header is accepted.
//     NOTE: on hosted, the XFF loop above already consumes the real-IP quota, so its "was limited" INFO means the edge address limited it, not XFF.
let sawLimitCf = false
const probe = await rest('leads', { method: 'POST', body: lead({ email: `cfp-${stamp}@example.test`, message: 'cf probe' }), headers: { 'cf-connecting-ip': `203.0.113.${(stamp % 200) + 1}` } })
if (probe.status === 403) {
  console.log('INFO  edge rejects a client-sent cf-connecting-ip with 403 (cannot be forged); testing the real address injected by the edge')
  for (let i = 0; i < 7; i++) {
    const x = await rest('leads', { method: 'POST', body: lead({ email: `real-${stamp}-${i}@example.test`, message: `real ${i}` }) })
    if ((await code(x)) === 'DS002') sawLimitCf = true
  }
} else {
  sawLimitCf = (await code(probe)) === 'DS002'
  for (let i = 0; i < 7 && !sawLimitCf; i++) {
    const x = await rest('leads', { method: 'POST', body: lead({ email: `cf-${stamp}-${i}@example.test`, message: `cf ${i}` }), headers: { 'cf-connecting-ip': `203.0.113.${(stamp % 200) + 1}` } })
    if ((await code(x)) === 'DS002') sawLimitCf = true
  }
}
check('more than 5 leads/hour from the same client address → DS002', sawLimitCf, 'not limited: the client address does not reach the database or intake_settings.trusted_ip_header is wrong')

r = await rest('testimonials', { method: 'POST', body: { name: '[staging-test] Ficticia', message: MSG, rating: 5, approved: true } })
check('anon review accepted but never published', r.status === 201, `status ${r.status}`)
r = await rest('testimonials?select=id&approved=eq.false'); const pend = r.ok ? await r.json() : []
check('anon sees no pending reviews', pend.length === 0, `${pend.length} visible`)
r = await rest('testimonials?name=like.*staging-test*', { method: 'PATCH', body: { approved: true } }); check('anon cannot approve', !r.ok, `status ${r.status}`)
r = await rest('testimonials?select=id&name=like.*staging-test*&approved=eq.true'); const pub = r.ok ? await r.json() : []
check('no staging-test review became public', pub.length === 0, `${pub.length} public`)
r = await rest('testimonials?select=*&approved=eq.true&limit=1'); check('legacy `select *` on testimonials works for the public', r.ok, `status ${r.status}`)

// Storage (anonymous) — name pattern and type are enforced by policies/bucket limits
const up = (bucket, name, type, bytes = 4) => fetch(`${URL_}/storage/v1/object/${bucket}/${name}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': type }, body: new Uint8Array(bytes) })
r = await up('testimonial-avatars', `${stamp}-stg${(stamp % 9999).toString().padStart(4, '0')}.png`, 'image/png'); check('anon uploads a valid avatar name/type', r.ok, `status ${r.status}`)
r = await up('testimonial-avatars', `${stamp}-stgevil.exe`, 'application/x-msdownload'); check('anon cannot upload .exe', !r.ok, `status ${r.status}`)
r = await up('agreement-documents', `${stamp}-x.png`, 'image/png'); check('anon cannot upload to the private documents bucket', !r.ok, `status ${r.status}`)
r = await up('testimonial-avatars', `${stamp}-big0.png`, 'image/png', 3 * 1024 * 1024); check('anon cannot upload > 2 MB avatar', !r.ok, `status ${r.status}`)

// ── authenticated roles (optional) ────────────────────────────────────────────
const admin = await login(process.env.STAGING_ADMIN_EMAIL, process.env.STAGING_ADMIN_PASSWORD)
const investor = await login(process.env.STAGING_INVESTOR_EMAIL, process.env.STAGING_INVESTOR_PASSWORD)
if (investor) {
  r = await rest('leads?select=id&limit=1', { token: investor }); const rows = r.ok ? await r.json() : []
  check('investor sees no leads', rows.length === 0, `${rows.length} rows`)
  r = await rest('testimonials?select=id&approved=eq.false', { token: investor }); const p2 = r.ok ? await r.json() : []
  check('investor sees no pending reviews', p2.length === 0, `${p2.length} rows`)
} else console.log('SKIP  investor tests (set STAGING_INVESTOR_EMAIL / PASSWORD)')
if (admin) {
  r = await rest('leads?select=id&source=eq.brief&limit=1', { token: admin }); const rows = r.ok ? await r.json() : []
  check('platform admin can read leads', r.ok && rows.length >= 1, `status ${r.status}`)
  r = await rest('testimonials?select=id&approved=eq.false', { token: admin }); const p3 = r.ok ? await r.json() : []
  check('platform admin sees pending reviews', r.ok && p3.length >= 1, `status ${r.status}, ${p3.length}`)
  if (p3.length) {
    const id = p3[0].id
    r = await rest(`testimonials?id=eq.${id}`, { method: 'PATCH', token: admin, body: { approved: true } }); check('admin approves a review', r.ok, `status ${r.status}`)
    r = await rest(`testimonials?id=eq.${id}`, { method: 'PATCH', token: admin, body: { approved: false } }); check('admin can unapprove (restore)', r.ok, `status ${r.status}`)
    r = await rest(`testimonials?id=eq.${id}`, { method: 'PATCH', token: admin, body: { message: 'editado' } }); check('admin cannot edit content (no grant on content columns)', !r.ok, `status ${r.status}`)
  }
} else console.log('SKIP  admin tests (set STAGING_ADMIN_EMAIL / PASSWORD)')

const failed = results.filter((x) => !x.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed.${failed.length ? ' FAILED: ' + failed.map((f) => f.name).join('; ') : ''}`)
console.log('Clean up afterwards (staging SQL editor): delete from public.leads where name like \'[staging-test]%\'; delete from public.testimonials where name like \'[staging-test]%\';')
process.exit(failed.length ? 1 : 0)
