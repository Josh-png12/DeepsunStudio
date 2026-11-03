// ORIGINAL v02 (3200) vs implementation (3100): section screenshots + pixelmatch, ES and EN.
const { chromium } = require('playwright-core')
const fs = require('fs'), path = require('path')
const { PNG } = require('pngjs'); const pixelmatch = require('pixelmatch')
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true })
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const REF = 'http://localhost:3200/deepsun_propuesta_integral.html', APP = 'http://localhost:3100/'
const widths = (process.argv[3] || '320,375,768,1440,1920').split(',').map(Number)
const langs = (process.argv[4] || 'es').split(',')
const sections = { hero: '.hero', marquee: '.hero-marquee', intro: '.intro', work: '.work', testimonios: '#testimonios', servicios: '#servicios', planes: '#planes', metodo: '#metodo', blog: '#blog', contacto: '#contacto', footer: '.footer' }
const rows = []
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  for (const lang of langs) for (const w of widths) {
    const shots = {}
    for (const [name, url] of [['ref', REF], ['impl', APP]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
      await ctx.addInitScript((l) => { try { localStorage.setItem('deepsun-lang', l) } catch {} }, lang)
      const p = await ctx.newPage()
      await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready)
      if (name === 'ref' && lang === 'en') await p.evaluate(() => document.querySelector('[data-lang=en]').click())
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;scroll-behavior:auto!important}.preview-banner,.wa-fab,.skip{display:none!important}' })
      await p.waitForTimeout(900)
      shots[name] = {}
      for (const [sn, sel] of Object.entries(sections)) {
        const el = await p.$(sel); if (!el) continue
        const f = path.join(OUT, `${lang}-${w}-${sn}-${name}.png`); await el.screenshot({ path: f }); shots[name][sn] = f
      }
      await ctx.close()
    }
    for (const sn of Object.keys(sections)) {
      const fa = shots.ref[sn], fb = shots.impl[sn]; if (!fa || !fb) { rows.push(`${lang} ${w} ${sn}: missing`); continue }
      const a = PNG.sync.read(fs.readFileSync(fa)), c = PNG.sync.read(fs.readFileSync(fb))
      if (a.width === c.width && a.height === c.height) {
        const d = new PNG({ width: a.width, height: a.height }); const n = pixelmatch(a.data, c.data, d.data, a.width, a.height, { threshold: 0.12 })
        fs.writeFileSync(path.join(OUT, `${lang}-${w}-${sn}-diff.png`), PNG.sync.write(d))
        rows.push(`${lang} ${w} ${sn.padEnd(11)} same size ${a.width}x${a.height}: ${(100 * n / (a.width * a.height)).toFixed(2)}% differ`)
      } else rows.push(`${lang} ${w} ${sn.padEnd(11)} size differs: v02 ${a.width}x${a.height} vs impl ${c.width}x${c.height}`)
    }
  }
  console.log(rows.join('\n')); await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
