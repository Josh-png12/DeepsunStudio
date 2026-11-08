import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { wrapTitle } from '../lib/blog-cover.ts'
import { getAllPosts, getPublishedSlugs } from '../lib/blog.ts'

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

test('wrapTitle keeps short titles intact and respects the line width', () => {
  assert.deepEqual(wrapTitle('Hola mundo'), ['Hola mundo'])
  const lines = wrapTitle('¿Por qué tu negocio en Colombia necesita un sitio web en 2026?'.toUpperCase(), 21, 3)
  assert.ok(lines.length <= 3)
  for (const l of lines) assert.ok(l.length <= 21, l)
})

test('wrapTitle truncates with an ellipsis after the last allowed line', () => {
  const lines = wrapTitle('uno dos tres cuatro cinco seis siete ocho nueve diez once doce', 10, 2)
  assert.equal(lines.length, 2)
  assert.ok(lines[1].endsWith('…'))
  assert.ok(lines.every((l) => l.length <= 10), JSON.stringify(lines))
  assert.deepEqual(wrapTitle('supercalifragilistico', 8, 1), ['supercal'])
  assert.deepEqual(wrapTitle('supercalifragilistico y más', 8, 1), ['superca…'])
})

test('every published post gets a generated cover; drafts get neither a page nor a cover', () => {
  const posts = getAllPosts()
  for (const p of posts) assert.equal(p.cover, `/blog-cover/${p.slug}`)
  const slugs = getPublishedSlugs()
  assert.ok(slugs.includes('automatizar-whatsapp-negocio'))
  assert.ok(!slugs.includes('cuanto-cuesta-sitio-web-colombia'), 'the pricing guide is a draft')
  const route = fs.readFileSync(path.join(ROOT, 'app', 'blog-cover', '[slug]', 'route.tsx'), 'utf8')
  assert.match(route, /dynamicParams = false/)
  assert.match(route, /runtime = 'nodejs'/)
})
