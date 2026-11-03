import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_E164, whatsappHref, mailtoHref, SITE } from '../lib/site.ts'

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

test('the official WhatsApp number is +57 324 618 3318 and is exposed consistently', () => {
  assert.equal(WHATSAPP_NUMBER, '573246183318')
  assert.equal(WHATSAPP_DISPLAY, '+57 324 618 3318')
  assert.equal(WHATSAPP_E164, '+573246183318')
})

test('wa.me links percent-encode accents, spaces, line breaks and reserved characters', () => {
  const text = 'Hola DeepSun, ¿cuánto cuesta?\nPlan "Pro" & más #1 — 50%'
  const href = whatsappHref(text)
  assert.ok(href.startsWith('https://wa.me/573246183318?text='))
  const encoded = href.split('?text=')[1]
  assert.ok(!/[\s"&#\n]/.test(encoded), 'no raw reserved characters in the query')
  assert.equal(decodeURIComponent(encoded), text, 'the message round-trips')
  assert.equal(new URL(href).searchParams.get('text'), text)
})

test('mailto links are encoded too', () => {
  assert.equal(mailtoHref('Hola & adiós'), `mailto:${SITE.email}?subject=${encodeURIComponent('Hola & adiós')}`)
})

function walk(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'design-reference', 'tests'].includes(e.name)) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(ts|tsx|json|mdx|md)$/.test(e.name) && !/package-lock/.test(e.name)) out.push(p)
  }
  return out
}

test('no previous number and no other hardcoded phone number remains in the code or content', () => {
  const offenders: string[] = []
  const files = ['app', 'components', 'lib', 'data', 'content', 'public'].flatMap((d) => (fs.existsSync(path.join(ROOT, d)) ? walk(path.join(ROOT, d)) : []))
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8')
    const rel = path.relative(ROOT, f).replace(/\\/g, '/')
    if (/573971496476|573197149647|319 ?714 ?9647|397 ?149 ?6476/.test(text)) offenders.push(`${rel}: previous number`)
    for (const m of text.matchAll(/wa\.me\/(\d+)/g)) if (m[1] !== '573246183318' && !text.includes('${')) offenders.push(`${rel}: wa.me/${m[1]}`)
    if (rel !== 'lib/site.ts' && text.includes('573246183318')) offenders.push(`${rel}: official number hardcoded outside lib/site.ts`)
    if (rel !== 'lib/site.ts' && /\+57 ?324 ?618 ?3318/.test(text)) offenders.push(`${rel}: display number hardcoded outside lib/site.ts`)
  }
  assert.deepEqual(offenders, [])
})
