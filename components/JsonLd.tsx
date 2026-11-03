// Server component — structured data for the public site (rendered by app/(site)/layout.tsx).
// Only facts that are published on the site itself. Deliberately NOT included (unverified or not applicable):
// opening hours, price range, accepted currencies, postal code, coordinates, social profiles, site search.
// The telephone is the official WhatsApp number confirmed by the owner (lib/site.ts).
import { SITE, WHATSAPP_E164 } from '@/lib/site'

const BASE_URL = SITE.url
const ORG_ID = `${BASE_URL}/#organization`

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'DeepSun Studio',
  alternateName: 'DeepSun',
  slogan: 'Menos ruido. Más intención.',
  description:
    'Estudio digital independiente en Riohacha, Colombia. Diseño digital, desarrollo web, software a medida y automatización para negocios en Colombia y Latinoamérica.',
  url: BASE_URL,
  email: SITE.email,
  telephone: WHATSAPP_E164,
  logo: `${BASE_URL}/icon.svg`,
  image: `${BASE_URL}/og-image`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Riohacha',
    addressRegion: 'La Guajira',
    addressCountry: 'CO',
  },
  areaServed: [
    { '@type': 'Country', name: 'Colombia' },
    { '@type': 'Place', name: 'Latinoamérica' },
  ],
  knowsLanguage: ['es', 'en'],
  founder: { '@type': 'Person', name: 'Joshua Navarro' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', telephone: WHATSAPP_E164, email: SITE.email, availableLanguage: ['es', 'en'] },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de DeepSun Studio',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Sitios web', description: 'Presencias digitales con carácter, rápidas y fáciles de usar.' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Software a medida', description: 'Herramientas pensadas para cómo funciona tu negocio.' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Automatización', description: 'Menos tareas repetitivas y más tiempo para lo importante.' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Diseño digital', description: 'Experiencias claras que conectan con personas reales.' } },
    ],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'DeepSun Studio',
  url: BASE_URL,
  description: 'Estudio digital independiente: diseño digital, desarrollo web, software a medida y automatización.',
  inLanguage: 'es-CO',
  publisher: { '@id': ORG_ID },
}

export function JsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  )
}

/** Breadcrumb for a page below a section, e.g. Inicio > Proyectos > Caso. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Inicio', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path === '/' ? '' : it.path}`,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

/** Article markup for a blog post (Spanish only, authored by the studio). */
export function ArticleJsonLd({ title, description, path, datePublished }: { title: string; description: string; path: string; datePublished?: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    inLanguage: 'es',
    mainEntityOfPage: `${BASE_URL}${path}`,
    ...(datePublished ? { datePublished } : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
