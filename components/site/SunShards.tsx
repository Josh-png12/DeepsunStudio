import type { CSSProperties } from 'react'
import { BANDS, CHAOS, HAIRLINES, SUN, bandOpacity, bandPath } from '@/lib/sun-geometry'

type Vars = CSSProperties & Record<`--${string}`, string | number>

// Pre-computed once at module load: pure geometry, identical on the server and in the browser (no hydration drift).
const SHARDS = BANDS.map(([y1, y2], i) => {
  const c = CHAOS[i]
  const style: Vars = {
    '--dx': `${c.dx}px`,
    '--dy': `${c.dy}px`,
    '--rot': `${c.rot}deg`,
    '--s': c.scale,
    '--c': c.color,
    '--o': bandOpacity(SUN.cy, SUN.r, y1, y2),
    '--i': i,
  }
  return { d: bandPath(SUN.cx, SUN.cy, SUN.r, y1, y2), style }
})

/**
 * The sun in pieces for the hero intro ("del caos a lo claro"). Purely decorative; laid exactly over `.sun-disk`
 * (inset 8% of `.sun-art`). Its states are driven by `data-intro` on `.sun-art` (see useSunIntro and ds-motion.css).
 */
export default function SunShards() {
  return (
    <svg className="sun-shards" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {SHARDS.map((s, i) => (
        <path key={i} className="shard" d={s.d} style={s.style} />
      ))}
      {HAIRLINES.map((l, i) => (
        <rect key={`h${i}`} className="hairline" x={l.x1} y={l.y} width={+(l.x2 - l.x1).toFixed(2)} height={l.h} style={{ '--i': i } as Vars} />
      ))}
    </svg>
  )
}
