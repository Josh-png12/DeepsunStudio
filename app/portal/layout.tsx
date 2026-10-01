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
  return <div className="portal-root"><a className="skip-nav" href="#portal-main">Saltar al contenido</a>{children}</div>
}

