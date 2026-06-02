// Server component — renders JSON-LD structured data in <head> via Next.js

const BASE_URL = 'https://www.deepsunstudio.com'

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joshua Navarro',
  jobTitle: 'Desarrollador Web Freelance',
  worksFor: {
    '@type': 'Organization',
    name: 'DeepSun Studio',
    url: BASE_URL,
  },
  url: BASE_URL,
  email: 'joshua@deepsunstudio.com',
  telephone: '+573197149647',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Riohacha',
    addressRegion: 'La Guajira',
    addressCountry: 'CO',
  },
  sameAs: [
    'https://github.com/Josh-png12',
    'https://www.linkedin.com/in/joshua-navarro-rad-06ab18258',
  ],
  knowsAbout: [
    'Desarrollo Web',
    'React',
    'Next.js',
    'Node.js',
    'Automatización',
    'SEO',
    'WhatsApp Bots',
    'Sistemas a Medida',
    'TypeScript',
    'PostgreSQL',
  ],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': BASE_URL,
  name: 'DeepSun Studio',
  description:
    'Agencia de desarrollo web y automatización para negocios en Colombia. Sitios web profesionales, chatbots WhatsApp y sistemas a medida para empresas en Riohacha, La Guajira y toda Latinoamérica.',
  url: BASE_URL,
  telephone: '+573197149647',
  email: 'joshua@deepsunstudio.com',
  founder: {
    '@type': 'Person',
    name: 'Joshua Navarro',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Riohacha',
    addressLocality: 'Riohacha',
    addressRegion: 'La Guajira',
    postalCode: '440001',
    addressCountry: 'CO',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 11.5444,
    longitude: -72.9072,
  },
  openingHours: 'Mo-Fr 08:00-18:00',
  priceRange: '$$',
  currenciesAccepted: 'COP, USD',
  areaServed: [
    {
      '@type': 'City',
      name: 'Riohacha',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'La Guajira',
    },
    {
      '@type': 'Country',
      name: 'Colombia',
    },
    {
      '@type': 'Continent',
      name: 'Latinoamérica',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Desarrollo Web y Automatización',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Diseño y Desarrollo Web',
          description:
            'Sitios web profesionales para negocios en Colombia. Landing pages, e-commerce, portafolios y sitios corporativos optimizados para SEO.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Automatización y WhatsApp Bots',
          description:
            'Chatbots y flujos automáticos de WhatsApp para negocios. Respuestas automáticas, notificaciones y atención 24/7.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sistemas a Medida',
          description:
            'Plataformas administrativas, dashboards y herramientas internas para empresas en Colombia.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'SEO y Posicionamiento Web',
          description:
            'Optimización SEO local y técnica para negocios en Riohacha, La Guajira y Colombia.',
        },
      },
    ],
  },
  image: `${BASE_URL}/og-image`,
  logo: `${BASE_URL}/og-image`,
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DeepSun Studio',
  alternateName: 'DeepSun Studio — Desarrollo Web Colombia',
  url: BASE_URL,
  description:
    'Portafolio y sitio profesional de DeepSun Studio. Desarrollo web para negocios en Colombia.',
  inLanguage: ['es-CO', 'en-US'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Proyectos',
      item: `${BASE_URL}/#projects`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Servicios',
      item: `${BASE_URL}/#hero`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Testimonios',
      item: `${BASE_URL}/#testimonials`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Contacto',
      item: `${BASE_URL}/#contact`,
    },
  ],
}

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
