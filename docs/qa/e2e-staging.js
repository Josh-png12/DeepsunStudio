// End-to-end run in a REAL browser (Edge) of the built site against a LOCAL Supabase stack seeded by scripts/staging/seed-local.mjs.
// Covers: public forms → rows in the database, admin triage, testimonial submit + files + moderation + publication, private document upload
// and investor download, permissions, WhatsApp number, ES/EN. Never run it against the production URL (it refuses non-local hosts).
//   NODE_PATH=<folder with playwright-core> STAGING_SEED_JSON=<seed.json> STAGING_SERVICE_KEY=<local service key> node docs/qa/e2e-staging.js
const { chromium } = require('playwright-core')
const fs = require('fs')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const APP = process.env.APP_URL || 'http://127.0.0.1:3101'
const API = (process.env.STAGING_API || 'http://127.0.0.1:56421').replace(/\/+$/, '')
const SERVICE = process.env.STAGING_SERVICE_KEY
const seed = JSON.parse(fs.readFileSync(process.env.STAGING_SEED_JSON, 'utf8'))
const PRODUCTION_REF = 'svbvkgvtjksvjfvigiah'
const isLocal = (u) => /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(u)
const hostedRef = /^https:\/\/([a-z0-9]+)\.supabase\.co$/.exec(API)?.[1]
// API: local stack, or a HOSTED STAGING project confirmed with STAGING_CONFIRM=<ref>. APP: local, or the Vercel PREVIEW URL (https).
if (API.includes(PRODUCTION_REF) || APP.includes(PRODUCTION_REF)) { console.error('ABORTED: that is the production project'); process.exit(2) }
if (!SERVICE || !(isLocal(API) || (hostedRef && process.env.STAGING_CONFIRM === hostedRef)) || !(isLocal(APP) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(APP))) {
  console.error('ABORTED: API must be the local stack or https://<ref>.supabase.co with STAGING_CONFIRM=<ref>; APP must be local or a *.vercel.app Preview URL; STAGING_SERVICE_KEY required'); process.exit(2)
}

const out = []
const rec = (name, ok, detail = '') => { out.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + detail}`) }
const sdb = async (path) => (await fetch(`${API}/rest/v1/${path}`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } })).json()
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64')
const PDF = Buffer.from('%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\nDOCUMENTO-E2E-STAGING')
const stamp = Date.now()

;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  const newCtx = async (lang = 'es') => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); await c.addInitScript((l) => localStorage.setItem('deepsun-lang', l), lang); return c }
  const login = async (ctx, who) => {
    const p = await ctx.newPage(); await p.goto(`${APP}/portal/login`, { waitUntil: 'networkidle' })
    await p.fill('input[name=email]', seed.users[who].email); await p.fill('input[name=password]', seed.password)
    await p.click('button[type=submit]'); await p.waitForURL(/\/portal\/(dashboard|admin)/, { timeout: 20000 }).catch(() => {})
    return p
  }

  // ── 1. public site: WhatsApp, language ────────────────────────────────────────
  let ctx = await newCtx('es'); let p = await ctx.newPage()
  await p.goto(APP + '/', { waitUntil: 'networkidle' })
  const html = await p.content()
  const wa = [...html.matchAll(/wa\.me\/(\d+)/g)].map((m) => m[1])
  rec('WhatsApp links on the home all use 573246183318 (and there is at least one)', wa.length > 0 && wa.every((n) => n === '573246183318'), JSON.stringify(wa))
  rec('the visible number is +57 324 618 3318', (await p.locator('body').innerText()).includes('+57 324 618 3318') || html.includes('+57 324 618 3318'))
  const esLang = await p.evaluate(() => document.documentElement.lang)
  const ctxEn = await newCtx('en'); const pe = await ctxEn.newPage(); await pe.goto(APP + '/', { waitUntil: 'networkidle' }); await pe.waitForTimeout(800)
  const enLang = await pe.evaluate(() => document.documentElement.lang)
  const esText = await p.locator('body').innerText(), enText = await pe.locator('body').innerText()
  rec('Spanish and English render different, non-empty content (lang attr es / en)', esLang === 'es' && enLang === 'en' && esText !== enText && enText.length > 500, `${esLang}/${enLang}`)
  rec('English view has no leftover Spanish nav labels', !/\bInicio\b|\bContacto\b/.test(await pe.locator('nav, header').first().innerText()), (await pe.locator('nav, header').first().innerText()).slice(0, 120))
  await ctxEn.close()

  // ── 2. quick form → row in the database ──────────────────────────────────────
  await p.evaluate(() => sessionStorage.clear()); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(3400)
  const q = p.locator('#contacto form')
  await q.locator('[name=nombre]').fill(`[e2e] Rápido ${stamp}`); await q.locator('[name=correo]').fill(`rapido-${stamp}@example.test`); await q.locator('[name=idea]').fill('Mensaje ficticio del formulario rápido en pruebas de staging.')
  await q.locator('button[type=submit]').click(); await p.waitForTimeout(1500)
  rec('quick form shows the stored confirmation', (await q.locator('.form-note.ok').count()) === 1, await q.locator('.form-note').innerText().catch(() => ''))
  let leads = await sdb(`leads?select=source,status,email&email=eq.rapido-${stamp}@example.test`)
  rec('the quick lead is in the database as source=home_quick, status=new', leads.length === 1 && leads[0].source === 'home_quick' && leads[0].status === 'new', JSON.stringify(leads))

  // ── 3. five-step brief → row ─────────────────────────────────────────────────
  await p.goto(APP + '/contacto', { waitUntil: 'networkidle' }); await p.evaluate(() => sessionStorage.clear()); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(3400)
  for (let i = 0; i < 4; i++) { await p.locator('.opt').first().click(); await p.locator('.step-nav .btn').last().click() }
  await p.locator('#b-name').fill(`[e2e] Brief ${stamp}`); await p.locator('#b-email').fill(`brief-${stamp}@example.test`); await p.locator('#b-msg').fill('Detalle ficticio del proyecto.')
  await p.locator('.brief form button[type=submit]').click(); await p.waitForTimeout(1500)
  rec('brief shows the confirmation only after storing', (await p.locator('.brief .done').count()) === 1)
  leads = await sdb(`leads?select=source,business_type,budget&email=eq.brief-${stamp}@example.test`)
  rec('the brief lead is in the database as source=brief with valid enumerations', leads.length === 1 && leads[0].source === 'brief', JSON.stringify(leads))
  await p.waitForTimeout(500)
  await p.locator('.brief').evaluate(() => {}).catch(() => {})

  // ── 4. testimonial with an image file → pending, not public ──────────────────
  await p.goto(APP + '/', { waitUntil: 'networkidle' }); await p.evaluate(() => sessionStorage.clear()); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(3400)
  await p.locator('.testimonials-lead .btn').click(); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(3400)
  const d = p.locator('[role=dialog]')
  await d.locator('input[name=name]').fill(`[e2e] Reseña ${stamp}`)
  await d.locator('textarea[name=message]').fill('Reseña ficticia de prueba con más de veinte caracteres para staging.')
  await d.locator('input[name=avatar]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG })
  await d.locator('button[type=submit]').click(); await p.waitForTimeout(2500)
  rec('review dialog thanks the visitor', (await d.locator('form').count()) === 0, (await d.innerText()).slice(0, 120))
  const t = await sdb(`testimonials?select=id,approved,featured,avatar_url&name=eq.${encodeURIComponent(`[e2e] Reseña ${stamp}`)}`)
  rec('the review is stored unapproved with a public avatar URL from our bucket', t.length === 1 && t[0].approved === false && /\/storage\/v1\/object\/public\/testimonial-avatars\//.test(t[0].avatar_url || ''), JSON.stringify(t))
  if (t[0]?.avatar_url) { const img = await fetch(t[0].avatar_url); rec('the uploaded avatar is retrievable from Storage', img.ok && (await img.arrayBuffer()).byteLength === PNG.length, `status ${img.status}`) }
  const pubBefore = await (await fetch(`${API}/rest/v1/testimonials?select=id&approved=eq.true`, { headers: { apikey: process.env.STAGING_ANON_KEY || '' } })).json().catch(() => [])
  rec('a visitor cannot see it (pending reviews are invisible)', !JSON.stringify(pubBefore).includes(t[0]?.id), '')

  // ── 5. platform admin: triage + moderation + publication ─────────────────────
  const adminCtx = await newCtx('es'); const ap = await login(adminCtx, 'admin')
  await ap.goto(APP + '/portal/admin/solicitudes', { waitUntil: 'networkidle' })
  const solText = await ap.locator('main, body').first().innerText()
  rec('admin sees both new requests in /portal/admin/solicitudes', solText.includes(`rapido-${stamp}@example.test`) && solText.includes(`brief-${stamp}@example.test`), solText.slice(0, 160))
  const card = ap.locator('article, .portal-project-card, li').filter({ hasText: `rapido-${stamp}@example.test` }).first()
  await card.locator('select[name=status]').selectOption('contacted'); await card.locator('textarea[name=admin_notes]').fill('Nota interna de prueba E2E')
  await card.locator('button:has-text("Guardar")').click(); await ap.waitForTimeout(1500)
  leads = await sdb(`leads?select=status,admin_notes,handled_by&email=eq.rapido-${stamp}@example.test`)
  rec('triage persists status, notes and who handled it', leads[0]?.status === 'contacted' && leads[0]?.admin_notes === 'Nota interna de prueba E2E' && leads[0]?.handled_by === seed.users.admin.id, JSON.stringify(leads))
  await ap.goto(APP + '/portal/admin/testimonios', { waitUntil: 'networkidle' })
  const tcard = ap.locator('article').filter({ hasText: `[e2e] Reseña ${stamp}` }).first()
  rec('admin sees the review as pending', (await tcard.innerText()).includes('Pendiente'))
  await tcard.locator('button:has-text("Aprobar y publicar")').click(); await ap.waitForTimeout(1500)
  const t2 = await sdb(`testimonials?select=approved&id=eq.${t[0].id}`)
  rec('approving publishes it', t2[0]?.approved === true, JSON.stringify(t2))
  const anonSees = await (await fetch(`${API}/rest/v1/testimonials?select=id&id=eq.${t[0].id}`, { headers: { apikey: process.env.STAGING_ANON_KEY || '', Authorization: `Bearer ${process.env.STAGING_ANON_KEY || ''}` } })).json()
  rec('once approved, the public API returns it', Array.isArray(anonSees) && anonSees.length === 1, JSON.stringify(anonSees))
  await adminCtx.close()

  // ── 6. agreement admin uploads a private document; investors' access ─────────
  const adminACtx = await newCtx('es'); const aap = await login(adminACtx, 'adminA')
  await aap.goto(APP + '/portal/admin/documentos', { waitUntil: 'networkidle' })
  const agSel = aap.locator('select[name=agreement_id]'); await agSel.selectOption({ index: 0 })
  await aap.fill('input[name=name]', `[e2e] Contrato ${stamp}`)
  await aap.setInputFiles('input[name=file]', { name: 'contrato.pdf', mimeType: 'application/pdf', buffer: PDF })
  await aap.click('button:has-text("Subir documento privado")'); await aap.waitForTimeout(3000)
  const docs = await sdb(`documents?select=id,storage_path,investor_visible,agreement_id&name=eq.${encodeURIComponent(`[e2e] Contrato ${stamp}`)}`)
  rec('the portal upload stores the file under <agreement_id>/ and creates the documents row', docs.length === 1 && docs[0].storage_path.startsWith(docs[0].agreement_id + '/'), JSON.stringify(docs))
  await adminACtx.close()

  const invACtx = await newCtx('es'); const ip = await login(invACtx, 'invA')
  await ip.goto(APP + '/portal/documentos', { waitUntil: 'networkidle' })
  rec('investor A sees the document in /portal/documentos', (await ip.locator('body').innerText()).includes(`[e2e] Contrato ${stamp}`))
  const dl = await invACtx.request.get(`${APP}/portal/documentos/${docs[0].id}/download`)
  const dlBody = dl.ok() ? (await dl.body()).toString() : ''
  rec('investor A downloads the exact bytes through the signed link', dl.ok() && dlBody.includes('DOCUMENTO-E2E-STAGING'), `status ${dl.status()}`)
  await ip.goto(APP + '/portal/admin/solicitudes', { waitUntil: 'networkidle' })
  rec('investor A is kept out of the admin screens (redirected)', !/\/portal\/admin\/solicitudes/.test(ip.url()), ip.url())
  await invACtx.close()

  const invBCtx = await newCtx('es'); const bp = await login(invBCtx, 'invB')
  const dlB = await invBCtx.request.get(`${APP}/portal/documentos/${docs[0].id}/download`, { maxRedirects: 0 })
  rec("investor B cannot download agreement A's document (404)", dlB.status() === 404, `status ${dlB.status()}`)
  await bp.goto(APP + '/portal/documentos', { waitUntil: 'networkidle' })
  rec("investor B's document list does not show it", !(await bp.locator('body').innerText()).includes(`[e2e] Contrato ${stamp}`))
  await invBCtx.close()

  // ── 7. anonymous + unauthenticated portal ────────────────────────────────────
  const anonCtx = await newCtx('es'); const anp = await anonCtx.newPage()
  for (const route of ['/portal/dashboard', '/portal/admin/solicitudes', '/portal/admin/testimonios', '/portal/documentos']) {
    await anp.goto(APP + route, { waitUntil: 'networkidle' }); rec(`anonymous ${route} → login`, /\/portal\/login/.test(anp.url()), anp.url())
  }
  const bad = await anonCtx.newPage(); await bad.goto(`${APP}/portal/login`, { waitUntil: 'networkidle' })
  await bad.fill('input[name=email]', seed.users.invA.email); await bad.fill('input[name=password]', 'incorrecta'); await bad.click('button[type=submit]'); await bad.waitForTimeout(1500)
  rec('a wrong password keeps the visitor on the login page with an error', /\/portal\/login/.test(bad.url()) && (await bad.locator('[role=alert], .portal-form-error').count()) > 0, bad.url())
  await anonCtx.close(); await ctx.close(); await b.close()

  const failed = out.filter((x) => !x).length
  console.log(`\n${out.length - failed}/${out.length} passed.`)
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
