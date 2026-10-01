import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n'
import { JsonLd } from '@/components/JsonLd'
import { LangSync } from '@/components/LangSync'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Analytics } from '@vercel/analytics/next'
// Fonts loaded via Fontshare <link> tags in <head> — see layout below

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL('https://www.deepsunstudio.com'),

  title: {
    default: 'DeepSun Studio — Desarrollo Web para Negocios en Colombia',
    template: '%s | DeepSun Studio',
  },

  description:
    'Diseñamos y desarrollamos sitios web profesionales, automatizaciones y sistemas a medida que hacen crecer negocios en Colombia. Trabajo con hoteles, clínicas, restaurantes y empresas en Riohacha, La Guajira y toda Latinoamérica.',

  keywords: [
    'desarrollador web Colombia',
    'diseño web para negocios Colombia',
    'agencia de desarrollo web Colombia',
    'desarrollador web Riohacha',
    'desarrollo web La Guajira',
    'diseño web para negocios Riohacha',
    'crear sitio web para mi negocio Colombia',
    'desarrollo web freelance Colombia',
    'automatización WhatsApp para negocios Colombia',
    'chatbot WhatsApp para restaurantes Colombia',
    'sistema web a medida para empresas Colombia',
    'página web para hoteles La Guajira',
    'desarrollo web para clínicas Colombia',
    'DeepSun Studio',
    'Joshua Navarro desarrollador',
    'Next.js Colombia',
    'React developer Colombia',
  ],

  authors: [{ name: 'Joshua Navarro', url: 'https://www.deepsunstudio.com' }],
  creator: 'Joshua Navarro',
  publisher: 'DeepSun Studio',

  alternates: {
    canonical: 'https://www.deepsunstudio.com',
    languages: {
      'es-CO': 'https://www.deepsunstudio.com',
      'en-US': 'https://www.deepsunstudio.com',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'es_CO',
    alternateLocale: 'en_US',
    url: 'https://www.deepsunstudio.com',
    siteName: 'DeepSun Studio',
    title: 'DeepSun Studio — Desarrollo Web para Negocios en Colombia',
    description:
      'Sitios web profesionales, automatizaciones y sistemas a medida que generan resultados reales. Trabajamos con negocios en Riohacha, La Guajira, Colombia y Latinoamérica.',
    images: [
      {
        url: '/og-image',
        width: 1200,
        height: 630,
        alt: 'DeepSun Studio — Desarrollo Web para Negocios en Colombia',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@deepsunstudio',
    creator: '@joshuanavarro',
    title: 'DeepSun Studio — Desarrollo Web para Negocios en Colombia',
    description:
      'Sitios web, automatizaciones y sistemas a medida para negocios en Colombia y Latinoamérica.',
    images: ['/og-image'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ─── Google Search Console ───────────────────────────────────────────────────
  // Para activar Google Search Console:
  // 1. Ir a search.google.com/search-console
  // 2. Agregar propiedad: www.deepsunstudio.com
  // 3. Verificar con el meta tag que Google provee
  // 4. Reemplazar 'PENDIENTE' con el código de verificación (solo el valor, sin el tag completo)
  // 5. Enviar sitemap: www.deepsunstudio.com/sitemap.xml
  verification: {
    google: 'PENDIENTE',
  },

  category: 'technology',

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },

  other: {
    'geo.region': 'CO-LAG',
    'geo.placename': 'Riohacha, La Guajira, Colombia',
    'geo.position': '11.5444;-72.9072',
    ICBM: '11.5444, -72.9072',
  },
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Fontshare — Cabinet Grotesk (display) + Switzer (body) */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&f[]=switzer@400,500,600&display=swap"
          rel="stylesheet"
        />
        {/* JetBrains Mono — mono/code outlier */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://svbvkgvtjksvjfvigiah.supabase.co" />
        <JsonLd />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <LangSync />
          {children}
          <WhatsAppButton />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
