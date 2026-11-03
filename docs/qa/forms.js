// Real-browser test of the three public forms against the fake backend, for every server response the guards can produce.
const { chromium } = require('playwright-core')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', APP = 'http://localhost:3100', MOCK = 'http://localhost:54399'
const set = (q) => fetch(`${MOCK}/__set?${q}`)
const log = async () => (await (await fetch(`${MOCK}/__log`)).json())
const out = []
const rec = (name, got, want) => { const ok = want instanceof RegExp ? want.test(got) : got === want; out.push(`${ok ? 'PASS' : 'FAIL'}  ${name} → ${got}`); if (!ok) process.exitCode = 1 }
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.addInitScript(() => localStorage.setItem('deepsun-lang', 'es'))
  const p = await ctx.newPage()
  const fresh = async (path) => { await p.goto(APP + path, { waitUntil: 'networkidle' }); await p.evaluate(() => sessionStorage.clear()); await p.waitForTimeout(3300) }

  // quick form
  for (const [mode, want, ok] of [['fail', /No pudimos enviar/, false], ['rate', /muchas solicitudes/, false], ['paused', /muchas solicitudes/, false], ['invalid', /Revisa tu nombre/, false], ['dup', /Ya habíamos recibido/, true], ['ok', /Recibido/, true]]) {
    await set(`l=${mode}`); await fresh('/')
    const f = p.locator('#contacto form')
    await f.locator('[name=nombre]').fill('Prueba QA'); await f.locator('[name=correo]').fill('qa@example.com'); await f.locator('[name=idea]').fill('Mensaje de prueba de formulario rápido.')
    await f.locator('button[type=submit]').click(); await p.waitForTimeout(900)
    const note = await f.locator('.form-note').innerText(); const kept = await f.locator('[name=nombre]').inputValue()
    rec(`quick/${mode}: message`, note, want); rec(`quick/${mode}: success styling only when stored`, String(await f.locator('.form-note.ok').count() === 1), String(ok)); rec(`quick/${mode}: fields ${ok ? 'cleared' : 'kept'}`, String(kept === ''), String(ok))
  }
  // brief form (5 steps)
  for (const [mode, want, done] of [['fail', /No pudimos enviar/, false], ['rate', /muchas solicitudes/, false], ['invalid', /no es válido/, false], ['dup', /Ya habíamos recibido/, true], ['ok', /Tu solicitud llegó/, true]]) {
    await set(`l=${mode}`); await fresh('/contacto'); await p.waitForTimeout(1200)
    for (let i = 0; i < 4; i++) { await p.locator('.opt').first().click(); await p.locator('.step-nav .btn').last().click() }
    await p.locator('#b-name').fill('Cliente Brief'); await p.locator('#b-email').fill('brief@example.com'); await p.locator('#b-msg').fill('Detalle del proyecto.')
    await p.locator('.brief form button[type=submit]').click(); await p.waitForTimeout(900)
    const text = await p.locator('.brief').innerText(); const hasDone = (await p.locator('.brief .done').count()) === 1
    rec(`brief/${mode}: ${done ? 'confirmation' : 'error, stays on form'}`, String(hasDone), String(done)); rec(`brief/${mode}: message`, text, want)
    if (!done) rec(`brief/${mode}: data kept`, await p.locator('#b-name').inputValue(), 'Cliente Brief')
  }
  // review form
  for (const [mode, want, done] of [['fail', /No se pudo enviar/, false], ['rate', /Recibimos muchas opiniones/, false], ['dup', /Gracias/, true], ['ok', /Gracias/, true]]) {
    await set(`l=${mode}`); await fresh('/')
    await p.locator('.testimonials-lead .btn').click(); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(3300)
    const d = p.locator('[role=dialog]'); await d.locator('input[name=name]').fill('Reseña QA'); await d.locator('textarea[name=message]').fill('Reseña de prueba con más de veinte caracteres para validar.')
    await d.locator('button[type=submit]').click(); await p.waitForTimeout(900)
    const txt = await d.innerText(); rec(`review/${mode}: message`, txt, want); rec(`review/${mode}: ${done ? 'thanks shown' : 'form kept'}`, String((await d.locator('form').count()) === 0), String(done))
  }
  // payload contract seen by the backend
  await set('l=ok'); await fresh('/')
  const f = p.locator('#contacto form'); await f.locator('[name=nombre]').fill('Payload QA'); await f.locator('[name=correo]').fill('payload@example.com'); await f.locator('[name=idea]').fill('Verifico la carga útil enviada.')
  await f.locator('button[type=submit]').click(); await p.waitForTimeout(900)
  await p.locator('.testimonials-lead .btn').click(); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(3300)
  const d = p.locator('[role=dialog]'); await d.locator('input[name=name]').fill('Payload Reseña'); await d.locator('textarea[name=message]').fill('Verifico que no se envíe approved desde el navegador.'); await d.locator('button[type=submit]').click(); await p.waitForTimeout(900)
  const writes = await log(); const lead = JSON.parse(writes.filter(w => w.table === 'leads').pop().body), testi = JSON.parse(writes.filter(w => w.table === 'testimonials').pop().body)
  rec('payload: lead.source', lead.source, 'home_quick'); rec('payload: lead has no status/admin fields', String(['status', 'admin_notes', 'client_hash', 'handled_by'].some(k => k in lead)), 'false'); rec('payload: lead.message has no "[Formulario" prefix hack', String(/Formulario r/.test(lead.message)), 'false')
  rec('payload: testimonial does not send approved/featured', String('approved' in testi || 'featured' in testi), 'false')
  console.log(out.join('\n')); await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
