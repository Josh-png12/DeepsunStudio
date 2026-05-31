import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#050812',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top-left blue glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-80px',
            width: '500px',
            height: '500px',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Bottom-right violet glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-60px',
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '64px 72px 0',
            flex: 1,
            justifyContent: 'center',
            gap: '0px',
            position: 'relative',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
            {/* DS logo mark */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(59,130,246,0.5)',
              }}
            >
              <span
                style={{
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                }}
              >
                DS
              </span>
            </div>

            {/* Brand name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                }}
              >
                DeepSun Studio
              </span>
              <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '15px', fontWeight: 400 }}>
                Riohacha, Colombia
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: 'white',
              marginBottom: '24px',
            }}
          >
            Desarrollo Web
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #67e8f9 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              para Negocios
            </span>{' '}
            <span style={{ color: 'white' }}>en</span>
            <br />
            Colombia.
          </div>

          {/* Description */}
          <p
            style={{
              color: 'rgba(148,163,184,0.85)',
              fontSize: '22px',
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: '680px',
              margin: '0 0 40px',
            }}
          >
            Sitios web profesionales, automatizaciones y sistemas a medida que generan
            resultados reales para empresas en La Guajira y toda Latinoamérica.
          </p>

          {/* Service badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Sitios Web', color: '#3b82f6' },
              { label: 'Automatización', color: '#8b5cf6' },
              { label: 'WhatsApp Bots', color: '#06b6d4' },
              { label: 'Sistemas a Medida', color: '#34d399' },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: `1px solid ${color}40`,
                  background: `${color}12`,
                  color: color,
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 72px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            position: 'relative',
          }}
        >
          {/* Gradient line on top of bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
            }}
          />

          <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '16px' }}>
            Desarrollador Web · Riohacha, La Guajira
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.3px',
            }}
          >
            www.deepsunstudio.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
