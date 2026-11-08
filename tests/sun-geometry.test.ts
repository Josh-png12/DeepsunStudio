import test from 'node:test'
import assert from 'node:assert/strict'
import { sunBands, bandPath, bandOpacity, chaosFor, BANDS, CHAOS, CHAOS_COLORS, HAIRLINES, SUN } from '../lib/sun-geometry.ts'

const numbersIn = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

for (const [r, cy] of [
  [SUN.r, SUN.cy],
  [78, 150], // the approved demo
] as const) {
  test(`bands (r=${r}, cy=${cy}) are finite, inside [cy-r, cy+r], ordered and non-overlapping`, () => {
    const bands = sunBands(r, cy)
    assert.ok(bands.length >= 6, `at least 6 bands, got ${bands.length}`)
    let prev = -Infinity
    for (const [y1, y2] of bands) {
      assert.ok(Number.isFinite(y1) && Number.isFinite(y2))
      assert.ok(y1 >= cy - r && y2 <= cy + r, `[${y1}, ${y2}] outside the circle`)
      assert.ok(y1 < y2, `empty band [${y1}, ${y2}]`)
      assert.ok(y1 >= prev, `band starting at ${y1} overlaps the previous one ending at ${prev}`)
      prev = y2
    }
    // Upper half is solid (three contiguous pieces ending at cy); stripes below get thinner.
    assert.equal(bands[2][1], cy)
    const lower = bands.slice(3).map(([a, b]) => b - a)
    for (let i = 1; i < lower.length; i++) assert.ok(lower[i] <= lower[i - 1] + 1e-9)
  })
}

test('bandPath: finite coordinates and half-widths never larger than r', () => {
  const { cx, cy, r } = SUN
  for (const [y1, y2] of BANDS) {
    const d = bandPath(cx, cy, r, y1, y2)
    assert.ok(!d.includes('NaN'), d)
    const nums = numbersIn(d)
    assert.ok(nums.every(Number.isFinite), d)
    // Absolute x coordinates are the M point, the H targets and the arc end points.
    const xs = [...d.matchAll(/(?:M|H)(-?[\d.]+)/g)].map((m) => Number(m[1]))
    const arcs = [...d.matchAll(/A[\d.]+ [\d.]+ 0 0 1 (-?[\d.]+) (-?[\d.]+)/g)]
    assert.equal(arcs.length, 2, 'two arcs with sweep-flag 1')
    for (const x of [...xs, ...arcs.map((m) => Number(m[1]))]) assert.ok(Math.abs(x - cx) <= r + 1e-9, `x=${x}`)
  }
  // Degenerate input (outside the circle) is clamped, not NaN.
  assert.ok(!bandPath(0, 0, 10, -20, 20).includes('NaN'))
})

test('CHAOS is deterministic, the same length as the bands and within the agreed ranges', () => {
  assert.equal(CHAOS.length, BANDS.length)
  assert.deepEqual(chaosFor(BANDS.length), CHAOS)
  for (const c of CHAOS) {
    assert.ok(Math.abs(c.dx) >= 70 && Math.abs(c.dx) <= 230, `dx=${c.dx}`)
    assert.ok(Math.abs(c.dy) >= 30 && Math.abs(c.dy) <= 120, `dy=${c.dy}`)
    assert.ok(Number.isFinite(c.rot) && c.scale > 0)
    assert.ok((CHAOS_COLORS as readonly string[]).includes(c.color))
  }
})

test('band opacity mirrors the real disk: solid on top, darker toward the bottom', () => {
  const { cy, r } = SUN
  const ops = BANDS.map(([a, b]) => bandOpacity(cy, r, a, b))
  assert.equal(ops[0], 1)
  assert.ok(ops.every((o) => o >= 0.15 && o <= 1))
  assert.ok(ops.at(-1)! < ops[3])
})

test('four finite horizon hairlines below the sun', () => {
  assert.equal(HAIRLINES.length, 4)
  for (const l of HAIRLINES) {
    assert.ok([l.x1, l.x2, l.y, l.h].every(Number.isFinite))
    assert.ok(l.y > SUN.cy + SUN.r && l.x1 < l.x2)
  }
})

test('the <head> skip script is valid JS, uses the shared key and never throws without storage', async () => {
  const { SUN_INTRO_KEY, SUN_INTRO_SCRIPT } = await import('../lib/sun-intro.ts')
  assert.equal(SUN_INTRO_KEY, 'ds:sun-intro')
  assert.ok(SUN_INTRO_SCRIPT.includes(`'${SUN_INTRO_KEY}'`))
  const run = new Function('sessionStorage', 'document', SUN_INTRO_SCRIPT)
  let attr: string | null = null
  const doc = { documentElement: { setAttribute: (_: string, v: string) => (attr = v) } }
  run({ getItem: () => null }, doc)
  assert.equal(attr, null, 'first visit: the intro plays')
  run({ getItem: () => '1' }, doc)
  assert.equal(attr, 'skip', 'same session: skipped before paint')
  assert.doesNotThrow(() => run({ getItem: () => { throw new Error('blocked') } }, doc))
})
