const { chromium } = require('playwright-core'); const fs = require('fs'), path = require('path')
const { PNG } = require('pngjs'); const pixelmatch = require('pixelmatch')
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true })
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
;(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true })
  for (const route of ['/portal/login', '/portal/forgot-password', '/portal/reset-password']) for (const w of [375, 1440]) {
    const shots = {}, info = {}
    for (const [name, base] of [['base', 'http://localhost:3300'], ['mine', 'http://localhost:3100']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage()
      await p.goto(base + route, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800)
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' })
      const f = path.join(OUT, `portal${route.replace(/\//g, '-')}-${w}-${name}.png`); await p.screenshot({ path: f, fullPage: true }); shots[name] = f
      info[name] = await p.evaluate(() => {
        const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
        const sel = (r) => r.selectorText || ''
        return { sheets: document.styleSheets.length, dsRules: rules.filter(r => /(^|[\s,])\.ds[\s.:\[,{>]/.test(sel(r)) || /^\.ds$/.test(sel(r))).length, dsKeyframes: rules.filter(r => r.type === 7 && /^ds-/.test(r.name)).length, bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 40), htmlBg: getComputedStyle(document.documentElement).backgroundColor, bodyBg: getComputedStyle(document.body).backgroundColor, lang: document.documentElement.lang, title: document.title, robots: document.querySelector('meta[name=robots]')?.content, jsonld: document.querySelectorAll('script[type="application/ld+json"]').length, fontLinks: [...document.querySelectorAll('link[rel=stylesheet]')].filter(l => /fontshare|googleapis/.test(l.href)).length }
      })
      await ctx.close()
    }
    const a = PNG.sync.read(fs.readFileSync(shots.base)), c = PNG.sync.read(fs.readFileSync(shots.mine))
    let pct = 'size differs ' + a.width + 'x' + a.height + ' vs ' + c.width + 'x' + c.height
    if (a.width === c.width && a.height === c.height) { const d = new PNG({ width: a.width, height: a.height }); const n = pixelmatch(a.data, c.data, d.data, a.width, a.height, { threshold: 0.1 }); pct = `${(100 * n / (a.width * a.height)).toFixed(3)}% pixels differ (${a.width}x${a.height})`; if (n) fs.writeFileSync(shots.mine.replace('-mine', '-diff'), PNG.sync.write(d)) }
    console.log(`${route} @${w}: ${pct}\n   base: ${JSON.stringify(info.base)}\n   mine: ${JSON.stringify(info.mine)}`)
  }
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
