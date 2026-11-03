// Real-browser audit (Edge headless) against the test build + fake local backend.
const { chromium } = require('playwright-core')
const fs = require('fs'), path = require('path')
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const APP = 'http://localhost:3100'
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true })
const log = (...a) => console.log(...a)
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })

  // ---- 1) Carousel: smooth scroll vs reduced motion
  for (const reduce of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference' })
    await ctx.addInitScript(() => { try { localStorage.setItem('deepsun-lang', 'es') } catch {} })
    const p = await ctx.newPage()
    await p.goto(APP + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.rv-card')
    const next = p.locator('.rv-nav button').nth(1)
    await next.scrollIntoViewIfNeeded()
    const samples = []
    await next.click()
    for (const t of [60, 160, 320, 600, 1100]) { await p.waitForTimeout(t === 60 ? 60 : 100 + (t - 160) * 0); samples.push(await p.evaluate(() => Math.round(document.querySelector('.rv-track').scrollLeft))) }
    const info = await p.evaluate(() => ({
      htmlBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      marquee: getComputedStyle(document.querySelector('.marquee-track')).animationName,
      pulseDur: getComputedStyle(document.querySelector('.pulse')).animationDuration,
      cards: document.querySelectorAll('.rv-card').length,
    }))
    log(`[carousel ${reduce ? 'REDUCED-MOTION' : 'normal'}] scrollLeft samples after click: ${samples.join(', ')} | html scroll-behavior=${info.htmlBehavior} marquee=${info.marquee} pulse=${info.pulseDur} cards=${info.cards}`)
    if (!reduce) { await p.locator('.rv-carousel').scrollIntoViewIfNeeded(); await p.locator('#testimonios').screenshot({ path: path.join(OUT, 'testimonios-con-datos-1440.png') }) }
    await ctx.close()
  }

  // ---- 2) Smooth anchor/page scroll: prefers no-preference vs reduce
  for (const reduce of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference' })
    const p = await ctx.newPage(); await p.goto(APP + '/', { waitUntil: 'networkidle' })
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await p.evaluate(() => document.querySelector('.hero-bottom .btn').click())
    const s = []; for (let i = 0; i < 4; i++) { await p.waitForTimeout(80); s.push(await p.evaluate(() => Math.round(scrollY))) }
    log(`[page nav ${reduce ? 'REDUCED' : 'normal'}] route after click: ${p.url().replace(APP, '')} (CTA is a route link, no in-page scroll)`)
    await ctx.close()
  }

  // ---- 3) Keyboard: focus order + visible indicator on home (60 tabs, desktop) and mobile menu
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await ctx.newPage(); await p.goto(APP + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.rv-card, .review-empty')
    const rows = [], noRing = []
    for (let i = 0; i < 70; i++) {
      await p.keyboard.press('Tab')
      const r = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), txt: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28), ring: c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0, shadow: c.boxShadow !== 'none', vis: b.width > 0 && b.height > 0 } })
      if (!r) continue
      rows.push(`${r.tag}:${r.txt}`)
      if (!r.ring && !r.shadow) noRing.push(`${r.tag}:${r.txt}`)
      if (!r.vis) noRing.push('HIDDEN-FOCUS ' + r.txt)
    }
    log(`[keyboard] ${rows.length} focus stops; first 12: ${rows.slice(0, 12).join(' > ')}`)
    log(`[keyboard] stops WITHOUT visible indicator: ${noRing.length ? noRing.join(' | ') : 'none'}`)
    await ctx.close()
  }

  // ---- 4) axe-core on every public route (ES) + home EN + open review dialog
  const routes = ['/', '/studio', '/servicios', '/proyectos', '/proyectos/siepa', '/proyectos/scraper-app-gui', '/blog', '/blog/cuanto-cuesta-sitio-web-colombia', '/contacto']
  for (const lang of ['es', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript((l) => { try { localStorage.setItem('deepsun-lang', l) } catch {} }, lang)
    const p = await ctx.newPage()
    for (const r of (lang === 'es' ? routes : ['/', '/servicios', '/contacto'])) {
      await p.goto(APP + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(700)
      await p.addScriptTag({ content: axeSrc })
      const res = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, sel: v.nodes[0].target.join(' ').slice(0, 70) })))
      log(`[axe ${lang} ${r}] ${res.length ? res.map(v => `${v.id}(${v.impact},${v.n}) e.g. ${v.sel}`).join(' ; ') : 'no violations'}`)
    }
    if (lang === 'es') {
      await p.goto(APP + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.rv-card')
      await p.locator('.testimonials-lead .btn').click(); await p.waitForSelector('[role=dialog]')
      await p.addScriptTag({ content: axeSrc })
      const res = await p.evaluate(async () => (await axe.run(document.querySelector('[role=dialog]'))).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, sel: v.nodes[0].target.join(' ').slice(0, 70) })))
      log(`[axe es review-dialog] ${res.length ? res.map(v => `${v.id}(${v.impact},${v.n}) e.g. ${v.sel}`).join(' ; ') : 'no violations'}`)
    }
    await ctx.close()
  }
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
