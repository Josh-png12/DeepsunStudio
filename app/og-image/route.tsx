import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Social image in the DeepSun Studio identity: Ink / Cream / Sun / Coral, geometric striped sun, "DEL CAOS A LO CLARO."
const INK = '#11151D', CREAM = '#F5F0E6', SUN = '#FFB83F', CORAL = '#D86741'

export async function GET() {
  const bars = Array.from({ length: 9 })
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: INK, display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        {/* Sun: disk with horizontal stripes on its lower half + thin rings */}
        <div style={{ position: 'absolute', right: '-150px', top: '70px', width: '640px', height: '640px', borderRadius: '50%', border: '1px solid rgba(255,184,63,0.25)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: '-110px', top: '110px', width: '560px', height: '560px', borderRadius: '50%', background: SUN, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '290px' }}>
            {bars.map((_, i) => (
              <div key={i} style={{ height: '16px', marginBottom: '16px', background: INK, display: 'flex' }} />
            ))}
          </div>
        </div>

        {/* Brand */}
        <div style={{ position: 'absolute', left: '72px', top: '56px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '14px' }}>
            <div style={{ width: '44px', height: '22px', background: SUN, borderRadius: '44px 44px 0 0', display: 'flex' }} />
            <div style={{ width: '44px', height: '4px', background: SUN, marginTop: '4px', display: 'flex' }} />
            <div style={{ width: '36px', height: '4px', background: SUN, marginTop: '5px', marginLeft: '4px', display: 'flex' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: CREAM, fontSize: '34px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 0.95 }}>deepsun</div>
            <div style={{ color: SUN, fontSize: '11px', fontWeight: 700, letterSpacing: '5px', marginTop: '4px' }}>STUDIO</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'absolute', left: '72px', top: '168px', display: 'flex', flexDirection: 'column', textTransform: 'uppercase', fontWeight: 900, fontSize: '118px', lineHeight: 0.92, letterSpacing: '-6px' }}>
          <div style={{ color: CREAM, display: 'flex' }}>Del caos</div>
          <div style={{ color: CREAM, display: 'flex' }}>a lo</div>
          <div style={{ display: 'flex' }}>
            <span style={{ color: SUN }}>Claro</span>
            <span style={{ color: CORAL }}>.</span>
          </div>
        </div>

        {/* Footer line */}
        <div style={{ position: 'absolute', left: '72px', bottom: '48px', color: 'rgba(245,240,230,0.75)', fontSize: '19px', letterSpacing: '3px', textTransform: 'uppercase', display: 'flex' }}>
          Estudio digital independiente · Riohacha, Colombia
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
