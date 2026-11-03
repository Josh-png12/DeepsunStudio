// axe-core across routes x languages x viewports + interactive states (dialog, mobile menu, open FAQ).
const { chromium } = require('playwright-core'); const fs = require('fs')
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', APP = 'http://localhost:3100'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const routes = ['/', '/studio', '/servicios', '/proyectos', '/proyectos/lufe-art-tattoo', '/proyectos/fundacion-vida-amor-salud', '/proyectos/siepa', '/proyectos/premios-la-cima', '/proyectos/scraper-app-gui', '/proyectos/ms-usuarios', '/blog', '/blog/automatizar-whatsapp-negocio', '/blog/cuanto-cuesta-sitio-web-colombia', '/blog/por-que-tu-negocio-necesita-sitio-web', '/contacto']
let total = 0, checks = 0
const run = async (p, label, ctx) => {
  await p.addScriptTag({ content: axeSrc })
  const v = await p.evaluate(async ([tags, ctx]) => (await axe.run(ctx ? document.querySelector(ctx) : document, { runOnly: { type: 'tag', values: tags } })).violations.map(x => `${x.id}(${x.impact},${x.nodes.length}) e.g. ${x.nodes[0].target.join(' ').slice(0, 80)}`), [TAGS, ctx || null])
  checks++; total += v.length
  if (v.length) console.log(`VIOLATION  ${label}: ${v.join(' ; ')}`)
}
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  for (const w of [1440, 375]) for (const lang of ['es', 'en']) {
    const c = await b.newContext({ viewport: { width: w, height: w === 375 ? 812 : 900 } })
    await c.addInitScript((l) => { try { localStorage.setItem('deepsun-lang', l) } catch {} }, lang)
    const p = await c.newPage()
    for (const r of routes) { await p.goto(APP + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await run(p, `${lang} ${w} ${r}`) }
    // home states
    await p.goto(APP + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
    await p.locator('.faq-item summary').first().click(); await run(p, `${lang} ${w} / (FAQ abierta)`)
    await p.locator('.testimonials-lead .btn').click(); await p.waitForSelector('[role=dialog]')
    await run(p, `${lang} ${w} diálogo reseña (vacío)`, '[role=dialog]')
    await p.locator('[role=dialog] form').evaluate(f => f.requestSubmit()); await p.waitForTimeout(3300); await p.locator('[role=dialog] form').evaluate(f => f.requestSubmit()); await p.waitForTimeout(400)
    await run(p, `${lang} ${w} diálogo reseña (con error)`, '[role=dialog]')
    await run(p, `${lang} ${w} página con diálogo abierto`)
    await p.keyboard.press('Escape')
    if (w === 375) { await p.locator('.menu-btn').click(); await run(p, `${lang} ${w} menú móvil abierto`) }
    await p.goto(APP + '/contacto', { waitUntil: 'networkidle' }); await p.waitForTimeout(4300)
    for (let i = 0; i < 4; i++) { await p.locator('.opt').first().click(); await p.locator('.step-nav .btn').last().click() }
    await run(p, `${lang} ${w} /contacto paso 5`)
    await p.locator('.brief form').evaluate(f => f.requestSubmit()); await p.waitForTimeout(300); await run(p, `${lang} ${w} /contacto paso 5 (con error)`)
    await c.close()
  }
  console.log(`\naxe: ${checks} comprobaciones, ${total} violaciones`); await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
