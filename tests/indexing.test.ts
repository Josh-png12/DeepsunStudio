import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const require = createRequire(import.meta.url)
const modulePath = require.resolve('../lib/indexing.js')

function isIndexableWith(vercelEnv: string | undefined): boolean {
  const previous = process.env.VERCEL_ENV
  if (vercelEnv === undefined) delete process.env.VERCEL_ENV
  else process.env.VERCEL_ENV = vercelEnv
  delete require.cache[modulePath]
  try {
    return require(modulePath).isIndexable
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = previous
    delete require.cache[modulePath]
  }
}

test('only the production deployment is indexable', () => {
  assert.equal(isIndexableWith('production'), true)
})

test('preview, development and unknown environments are never indexable', () => {
  assert.equal(isIndexableWith('preview'), false)
  assert.equal(isIndexableWith('development'), false)
  assert.equal(isIndexableWith(undefined), false)
})

function originWith(vercelEnv: string | undefined, vercelUrl: string | undefined): string {
  const prev = { e: process.env.VERCEL_ENV, u: process.env.VERCEL_URL }
  for (const [k, v] of [['VERCEL_ENV', vercelEnv], ['VERCEL_URL', vercelUrl]] as const) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  delete require.cache[modulePath]
  try {
    return require(modulePath).siteOrigin('https://www.deepsunstudio.com')
  } finally {
    for (const [k, v] of [['VERCEL_ENV', prev.e], ['VERCEL_URL', prev.u]] as const) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
    delete require.cache[modulePath]
  }
}

test('production advertises the official domain; a Preview advertises its own host, never deepsunstudio.com', () => {
  assert.equal(originWith('production', 'joshua-abc.vercel.app'), 'https://www.deepsunstudio.com')
  assert.equal(originWith('preview', 'joshua-abc.vercel.app'), 'https://joshua-abc.vercel.app')
  assert.equal(originWith(undefined, undefined), 'http://localhost:3000')
})
