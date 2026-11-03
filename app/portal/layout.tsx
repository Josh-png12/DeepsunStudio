import type { Metadata } from 'next'
import './portal.css'

export const metadata: Metadata = {
  title: 'Portal privado',
  description: 'Acceso privado para miembros de acuerdos DeepSun Studio.',
  robots: { index: false, follow: false, nocache: true },
  openGraph: null,
  twitter: null,
}

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-root">
      {/* Portal fonts (moved here from the root layout so public pages do not load them) */}
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&f[]=switzer@400,500,600&display=swap" rel="stylesheet" precedence="default" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" precedence="default" />
      <a className="skip-nav" href="#portal-main">Saltar al contenido</a>
      {children}
    </div>
  )
}

