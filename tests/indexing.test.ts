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
