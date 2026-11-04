// Launch 1.0 smoke test (real browser, desktop + mobile). Read-only: it only GETs pages.
//   APP_URL=http://127.0.0.1:3110 NODE_PATH=<folder with playwright-core> node scripts/launch/smoke.mjs
// Optional: SCREENSHOT_DIR=<folder> to save one screenshot per page/viewport; BYPASS_SECRET=<Vercel automation bypass> for a protected Preview.
// Every request to *.supabase.co is aborted AND counted: the informational launch must not depend on any database.
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')

const BASE = (process.env.APP_URL ?? 'http://127.0.0.1:3110').replace(/\/$/, '')
const SHOTS = process.env.SCREENSHOT_DIR
const SECRET = process.env.BYPASS_SECRET
const EDGE = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const WA = '573246183318'

let pass = 0
let fail = 0
const check = (name, ok, extra = '') => {
  if (ok) pass++
  else fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : extra ? '  → ' + extra : ''}`)
}

const OK_PAGES = ['/', '/studio', '/servicios', '/proyectos', '/proyectos/scraper-app-gui', '/proyectos/ms-usuarios', '/blog',
  '/blog/automatizar-whatsapp-negocio', '/blog/por-que-tu-negocio-necesita-sitio-web', '/contacto']
const GONE = ['/portal', '/portal/login', '/portal/admin/solicitudes', '/proyectos/lufe-art-tattoo', '/proyectos/fundacion-vida-amor-salud',
  '/proyectos/siepa', '/proyectos/premios-la-cima', '/blog/cuanto-cuesta-sitio-web-colombia', '/api/stats', '/api/projects', '/api/experience']
const BANNED_TEXT = [/US\$\s?\d/, /\b4\.200\b/, /\b10\+/, /\b6\+/, /\b3\+ años/i, /24\/7/, /tu-dominio\.com/i, /LUFE|SIEPA|Premios La Cima|Fundaci[oó]n Vida/i, /\+57 319|573197149647/]

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const extraHeaders = SECRET ? { 'x-vercel-protection-bypass': SECRET, 'x-vercel-set-bypass-cookie': 'true' } : undefined
const supabaseRequests = []

for (const vp of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, extraHTTPHeaders: extraHeaders })
  await ctx.route(/supabase\.co/, (r) => { supabaseRequests.push(r.request().url()); return r.abort() })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)) })
  // /_vercel/* (Analytics) exists only on Vercel, so it 404s on a local server: not an error of the site.
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/_vercel/')) errors.push(`${r.status()} ${r.url().replace(BASE, '')} (from ${page.url().replace(BASE, '') || '/'})`) })

  for (const p of OK_PAGES) {
    const res = await page.goto(BASE + p, { waitUntil: 'networkidle' })
    const status = res?.status()
    check(`[${vp.name}] ${p} → 200`, status === 200, `status ${status}`)
    const html = await page.content()
    const text = await page.locator('body').innerText()
    check(`[${vp.name}] ${p} has no <form>, no data inputs`, (await page.locator('form').count()) === 0 && (await page.locator('input:not([type=hidden]), textarea').count()) === 0)
    const bad = BANNED_TEXT.filter((re) => re.test(text) || re.test(html.replace(/<script[\s\S]*?<\/script>/g, '')))
    check(`[${vp.name}] ${p} shows no unverified claims / old number / hidden clients`, bad.length === 0, bad.map(String).join(' '))
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    check(`[${vp.name}] ${p} has no horizontal scroll`, overflow <= 1, `${overflow}px`)
    const portalLinks = await page.locator('a[href^="/portal"]').count()
    check(`[${vp.name}] ${p} has no link to the portal`, portalLinks === 0)
    const waNums = await page.$$eval('a[href*="wa.me/"]', (as) => [...new Set(as.map((a) => (a.getAttribute('href').match(/wa\.me\/(\d+)/) ?? [])[1]))])
    check(`[${vp.name}] ${p} WhatsApp links only use +57 324 618 3318`, waNums.every((n) => n === WA), waNums.join(','))
    if (p === '/' || p === '/contacto') check(`[${vp.name}] ${p} offers WhatsApp (${WA})`, waNums.includes(WA))
    const robots = await page.locator('meta[name=robots]').getAttribute('content')
    const canonical = await page.locator('link[rel=canonical]').getAttribute('href')
    if (vp.name === 'desktop') console.log(`      robots=${robots} canonical=${canonical}`)
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${vp.name}${p === '/' ? '-home' : p.replace(/\//g, '-')}.png`), fullPage: true }) }
  }

  for (const p of GONE) {
    const res = await ctx.request.get(BASE + p, { headers: extraHeaders, maxRedirects: 0 })
    check(`[${vp.name}] ${p} → 404 (not published)`, res.status() === 404, `status ${res.status()}`)
  }

  // Navigation: every internal link of the home must resolve to a published page.
  if (vp.name === 'desktop') {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    const hrefs = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('#')[0].split('?')[0]).filter(Boolean))])
    for (const h of hrefs) {
      const r = await ctx.request.get(BASE + h, { headers: extraHeaders })
      check(`home link ${h} → 200`, r.status() === 200, `status ${r.status()}`)
    }
    const sm = await (await ctx.request.get(BASE + '/sitemap.xml', { headers: extraHeaders })).text()
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    check('sitemap lists only published pages (no hidden case, no draft, no portal)', locs.length > 0 && !locs.some((l) => /lufe|siepa|cima|fundacion|cuanto-cuesta|portal/.test(l)), locs.join(' '))
    const rb = await (await ctx.request.get(BASE + '/robots.txt', { headers: extraHeaders })).text()
    console.log('      robots.txt:', rb.replace(/\n+/g, ' | ').slice(0, 200))
  }

  check(`[${vp.name}] no console/page errors`, errors.length === 0, errors.slice(0, 3).join(' || '))
  await ctx.close()
}

check('no request to any *.supabase.co host during the whole visit', supabaseRequests.length === 0, [...new Set(supabaseRequests)].join(' '))
await browser.close()
console.log(`\n${pass}/${pass + fail} checks passed`)
process.exit(fail ? 1 : 0)
