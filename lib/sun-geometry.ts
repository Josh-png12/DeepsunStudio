/**
 * Geometry of the hero's "del caos a lo claro" intro: the striped sun cut into horizontal bands.
 * Pure and deterministic (no Math.random / Math.sin): the same markup is produced on the server and in the browser.
 *
 * Reference: the approved demo used r = 78, cy = 150 in a 680×330 viewBox. Lengths below are written in those
 * demo units and scaled by r / 78, so `sunBands(78, 150)` reproduces the demo and the component uses a 200×200 box.
 */

export type Band = readonly [y1: number, y2: number]

export interface Chaos {
  /** Offset in viewBox units. */
  dx: number
  dy: number
  /** Degrees. */
  rot: number
  scale: number
  color: string
}

export interface Hairline {
  x1: number
  x2: number
  y: number
  h: number
}

const DEMO_R = 78
const round = (n: number, d = 2) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

/** The sun of the component: it fills the 200×200 viewBox, which is laid exactly over `.sun-disk`. */
export const SUN = { cx: 100, cy: 100, r: 100 } as const

/**
 * Bands [y1, y2] from top to bottom: three solid pieces for the upper half (cut at -0.615r and -0.256r), then
 * thinner and thinner stripes (15, 12.6, 10.2, 7.8… demo units) separated by growing gaps, clipped to cy + r.
 */
export function sunBands(r: number, cy: number): Band[] {
  const k = r / DEMO_R
  const bands: Band[] = [
    [cy - r, cy - 0.615 * r],
    [cy - 0.615 * r, cy - 0.256 * r],
    [cy - 0.256 * r, cy],
  ]
  const bottom = cy + r
  let gap = 3.5
  let h = 15
  let y = cy + gap * k
  while (y < bottom && h > 1) {
    const y2 = Math.min(y + h * k, bottom)
    if (y2 - y >= 0.5 * k) bands.push([y, y2])
    gap += 1.5
    h -= 2.4
    y = y2 + gap * k
  }
  return bands.map(([a, b]) => [round(a), round(b)] as const)
}

const halfWidth = (cy: number, r: number, y: number) => Math.sqrt(Math.max(0, r * r - (y - cy) ** 2))

/** SVG path of the slice of the circle between heights y1 and y2: straight cuts, circular sides (sweep 1 both). */
export function bandPath(cx: number, cy: number, r: number, y1: number, y2: number): string {
  const w1 = halfWidth(cy, r, y1)
  const w2 = halfWidth(cy, r, y2)
  const p = (n: number) => String(round(n))
  return (
    `M${p(cx - w1)} ${p(y1)}H${p(cx + w1)}` +
    `A${p(r)} ${p(r)} 0 0 1 ${p(cx + w2)} ${p(y2)}` +
    `H${p(cx - w2)}` +
    `A${p(r)} ${p(r)} 0 0 1 ${p(cx - w1)} ${p(y1)}Z`
  )
}

/**
 * Final opacity of a band so the assembled sun approximates `.sun-disk:after` (a fade to 85% ink that starts at
 * 49% of the disk height and ends at 101%). Makes the cross-fade to the real disk nearly invisible.
 */
export function bandOpacity(cy: number, r: number, y1: number, y2: number): number {
  const top = cy - r
  const d = 2 * r
  const start = top + 0.49 * d
  const span = 0.52 * d
  const t = Math.min(1, Math.max(0, ((y1 + y2) / 2 - start) / span))
  return round(1 - 0.85 * t)
}

export const CHAOS_COLORS = ['#D86741', '#5A6475', '#FFB83F', '#F5F0E6'] as const

/** Small integer PRNG (mulberry32): identical sequence in every JS engine, unlike Math.sin-based hashes. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic "scattered" state for n pieces: |dx| 70–230, |dy| 30–120 (viewBox units), alternating sides. */
export function chaosFor(n: number, seed = 20260): Chaos[] {
  const rnd = mulberry32(seed)
  return Array.from({ length: n }, (_, i) => {
    const sx = i % 2 === 0 ? -1 : 1
    const sy = i % 3 === 1 ? 1 : -1
    return {
      dx: round(sx * (70 + rnd() * 160), 1),
      dy: round(sy * (30 + rnd() * 90), 1),
      rot: round((rnd() - 0.5) * 90, 1),
      scale: round(0.6 + rnd() * 0.5),
      color: CHAOS_COLORS[i % CHAOS_COLORS.length],
    }
  })
}

export const BANDS: Band[] = sunBands(SUN.r, SUN.cy)
export const CHAOS: Chaos[] = chaosFor(BANDS.length)

/** Four thin horizon lines under the sun (demo: y = 236, 245, 255, 266), rescaled to SUN. */
export const HAIRLINES: Hairline[] = (() => {
  const k = SUN.r / DEMO_R
  const demo: Array<[y: number, half: number]> = [
    [236, 74],
    [245, 60],
    [255, 44],
    [266, 26],
  ]
  return demo.map(([y, half]) => ({
    x1: round(SUN.cx - half * k),
    x2: round(SUN.cx + half * k),
    y: round(SUN.cy + (y - 150) * k),
    h: round(0.8 * k),
  }))
})()
