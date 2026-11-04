import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { CASE_PUBLISHED, FORMS_ENABLED, PORTAL_ENABLED, LEGACY_API_ENABLED, SHOW_UNVERIFIED_FIGURES } from '../lib/launch.ts'

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

test('launch 1.0 defaults: forms, portal and legacy API are off; unverified figures are hidden', () => {
  // These tests run without NEXT_PUBLIC_* flags, exactly like the production build.
  assert.equal(FORMS_ENABLED, false)
  assert.equal(PORTAL_ENABLED, false)
  assert.equal(LEGACY_API_ENABLED, false)
  assert.equal(SHOW_UNVERIFIED_FIGURES, false)
})

test('client cases with pending permission are hidden; only in-house projects are published', () => {
  const published = Object.entries(CASE_PUBLISHED).filter(([, on]) => on).map(([slug]) => slug).sort()
  assert.deepEqual(published, ['ms-usuarios', 'scraper-app-gui'])
  // The content is kept in the repository for later activation.
  const data = read('data/portfolio.ts')
  for (const slug of ['lufe-art-tattoo', 'fundacion-vida-amor-salud', 'siepa', 'premios-la-cima']) {
    assert.ok(data.includes(`slug: "${slug}"`), `${slug} must stay in data/portfolio.ts`)
    assert.equal(CASE_PUBLISHED[slug], false)
  }
})

test('published plans and FAQ carry no prices, quantified terms, delivery times or 24/7 promises', () => {
  const src = read('lib/site-content.ts')
  const plans = src.slice(src.indexOf('export const PLANS: PlanCopy[]'), src.indexOf('/** NOT PUBLISHED. Previous plan copy'))
  const faq = src.slice(src.indexOf('export const FAQ:'), src.indexOf('/** NOT PUBLISHED. Previous FAQ'))
  assert.ok(plans.length > 500 && faq.length > 500, 'blocks were located')
  assert.ok(!/usd:\s*\d/.test(plans), 'no plan has a price')
  for (const [name, block] of [['PLANS', plans], ['FAQ', faq]] as const) {
    assert.ok(!/24\/7|\d+\s?%|US\$|\bCOP\b|\d+\s?(días|days|meses|months|rondas|rounds|páginas|pages)|hasta \d+|up to \d+/i.test(block), `${name} has an unverified claim`)
  }
})

test('published blog posts contain no unsourced statistics, prices or guarantees; the pricing guide is a draft', () => {
  const dir = path.join(ROOT, 'content', 'blog')
  let published = 0
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'))
    if (data.draft === true) continue
    published++
    const all = `${data.title}\n${data.description}\n${content}`
    assert.ok(!/\d+\s?%|\$\s?\d|\bCOP\b|\bUSD\b|24\/7|\d+ horas semanales|se paga solo/i.test(all), `${f} has an unverified claim`)
  }
  assert.ok(published >= 2)
  assert.equal(matter(fs.readFileSync(path.join(dir, 'cuanto-cuesta-sitio-web-colombia.mdx'), 'utf8')).data.draft, true)
})

test('the public pages reach the backend only behind the launch flags', () => {
  assert.ok(/FORMS_ENABLED \? <ReviewsSection \/> : null/.test(read('components/site/Reviews.tsx')))
  assert.ok(/FORMS_ENABLED \? <QuickForm \/> : <WhatsAppCard \/>/.test(read('components/site/ContactBlock.tsx')))
  assert.ok(/FORMS_ENABLED \? <BriefForm \/> : <WhatsAppCard \/>/.test(read('components/site/ContactoView.tsx')))
  assert.ok(/if \(!PORTAL_ENABLED\)/.test(read('proxy.ts')))
})
