import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SITE } from '@/lib/site'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '@/lib/seo'
import { Analytics } from '@vercel/analytics/next'
import { isIndexable } from '@/lib/indexing'
import { FORMS_ENABLED, PORTAL_ENABLED } from '@/lib/launch'
// Public fonts: next/font in app/(site)/layout.tsx. Portal fonts (Fontshare + JetBrains Mono): app/portal/layout.tsx.

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#11151D',
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
// Canonical, Open Graph URL and title are set per page (lib/seo.ts); the portal sets its own robots/metadata.
// No hreflang: English is a client-side view of the same URLs, not separate indexable pages.

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),

  title: {
    default: DEFAULT_TITLE,
    template: '%s | DeepSun Studio',
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: 'DeepSun Studio',

  keywords: [
    'estudio digital independiente',
    'diseño web para negocios Colombia',
    'desarrollo web Colombia',
    'desarrollo web Riohacha',
    'diseño web La Guajira',
    'software a medida Colombia',
    'automatización de procesos',
    'automatización WhatsApp para negocios',
    'sitio web para mi negocio',
    'DeepSun Studio',
  ],

  authors: [{ name: 'DeepSun Studio', url: SITE.url }],
  creator: 'DeepSun Studio',
  publisher: 'DeepSun Studio',

  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName: 'DeepSun Studio',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/og-image', width: 1200, height: 630, alt: 'DeepSun Studio — Del caos a lo claro.', type: 'image/png' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image'],
  },

  // Only the real production deployment is indexable (lib/indexing.js); Preview/local builds get noindex here, in robots.txt and in X-Robots-Tag.
  robots: isIndexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : { index: false, follow: false, nocache: true },

  // Google Search Console: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token value (no placeholder is emitted otherwise).
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),

  category: 'business',

  // Icon comes from app/icon.svg (file convention).

  other: {
    'geo.region': 'CO-LAG',
    'geo.placename': 'Riohacha, La Guajira, Colombia',
  },
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Launch 1.0: public pages use no database, so no hint to Supabase (lib/launch.ts). */}
        {(FORMS_ENABLED || PORTAL_ENABLED) && <link rel="dns-prefetch" href="https://svbvkgvtjksvjfvigiah.supabase.co" />}
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
