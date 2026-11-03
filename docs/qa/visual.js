// Real-browser (Edge, headless) visual comparison: v02 reconstruction (3200) vs implementation (3100).
const { chromium } = require('playwright-core')
const fs = require('fs'), path = require('path')
const { PNG } = require('pngjs'); const pixelmatch = require('pixelmatch')
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const REF = 'http://localhost:3200/integral-reconstruccion.html', APP = 'http://localhost:3100/'
const widths = [320, 375, 768, 1440, 1920]
const sections = { hero: '.hero', testimonios: '#testimonios', planes: '#planes', contacto: '#contacto' }
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  const res = []
  for (const w of widths) {
    for (const [name, url] of [['ref', REF], ['impl', APP]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
      await ctx.addInitScript(() => { try { localStorage.setItem('deepsun-lang', 'es') } catch {} })
      const p = await ctx.newPage()
      await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200)
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;scroll-behavior:auto!important}' })
      for (const [sn, sel] of Object.entries(sections)) {
        if (!['hero'].includes(sn) && ![375, 1440].includes(w)) continue
        const el = await p.$(sel); if (!el) continue
        await el.screenshot({ path: path.join(OUT, `${w}-${sn}-${name}.png`) })
      }
      await ctx.close()
    }
    // pixel diff of the hero (same content in both)
    const a = PNG.sync.read(fs.readFileSync(path.join(OUT, `${w}-hero-ref.png`))), c = PNG.sync.read(fs.readFileSync(path.join(OUT, `${w}-hero-impl.png`)))
    if (a.width === c.width && a.height === c.height) {
      const diff = new PNG({ width: a.width, height: a.height })
      const n = pixelmatch(a.data, c.data, diff.data, a.width, a.height, { threshold: 0.12 })
      fs.writeFileSync(path.join(OUT, `${w}-hero-diff.png`), PNG.sync.write(diff))
      res.push(`${w}px hero ${a.width}x${a.height}: ${(100 * n / (a.width * a.height)).toFixed(2)}% pixels differ`)
    } else res.push(`${w}px hero size differs ref ${a.width}x${a.height} vs impl ${c.width}x${c.height}`)
  }
  console.log(res.join('\n'))
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
