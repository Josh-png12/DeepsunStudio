import { ImageResponse } from 'next/og'
import { getAllPosts, getPublishedSlugs } from '@/lib/blog'
import { wrapTitle } from '@/lib/blog-cover'

// Node runtime: lib/blog reads the MDX files with fs. Rendered once per published post at build time;
// any other slug (unknown or draft) is a 404, so the endpoint cannot be used to render arbitrary text.
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }))
}

// Same identity as app/og-image: Ink background, striped geometric sun, flat colors (no gradients, no glow).
const INK = '#11151D', CREAM = '#F5F0E6', SUN = '#FFB83F', CORAL = '#D86741'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getAllPosts().find((p) => p.slug === slug) // published only: drafts are filtered out
  if (!post) return new Response('Not found', { status: 404 })

  // Text comes from our own repository files and is rendered as text nodes by Satori (never parsed as markup).
  const lines = wrapTitle(post.title.toUpperCase(), 21, 3)
  const category = post.category.toUpperCase().slice(0, 40)
  const bars = Array.from({ length: 7 })

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: INK, display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        {/* Sun, bottom right: disk with stripes on its lower half + one thin ring */}
        <div style={{ position: 'absolute', right: '-190px', top: '150px', width: '560px', height: '560px', borderRadius: '50%', border: '1px solid rgba(255,184,63,0.25)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: '-160px', top: '180px', width: '500px', height: '500px', borderRadius: '50%', background: SUN, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '255px' }}>
            {bars.map((_, i) => (
              <div key={i} style={{ height: '15px', marginBottom: '20px', background: INK, display: 'flex' }} />
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ position: 'absolute', left: '72px', top: '64px', display: 'flex', alignItems: 'center', color: SUN, fontSize: '20px', fontWeight: 700, letterSpacing: '4px' }}>
          <div style={{ width: '36px', height: '2px', background: SUN, marginRight: '16px', display: 'flex' }} />
          {category}
        </div>

        {/* Title (max 3 lines, "…" when longer) */}
        <div style={{ position: 'absolute', left: '72px', top: '150px', width: '840px', display: 'flex', flexDirection: 'column', fontWeight: 900, fontSize: '66px', lineHeight: 1.02, letterSpacing: '-2px', color: CREAM }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex' }}>{l}</div>
          ))}
        </div>

        {/* Signature */}
        <div style={{ position: 'absolute', left: '72px', bottom: '56px', display: 'flex', fontSize: '19px', fontWeight: 700, letterSpacing: '3px', color: 'rgba(245,240,230,0.8)' }}>
          DEEPSUN STUDIO · DEL CAOS A LO CLARO<span style={{ color: CORAL }}>.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
