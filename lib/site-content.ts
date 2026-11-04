// Bilingual editorial copy for the public site (ES = source of truth, EN = faithful translation).
// Markup allowed in strings: <br>, <em>, <b>. Nothing here comes from user input.
import type { L } from '@/lib/site-i18n'
import { FORMS_ENABLED } from '@/lib/launch'

export const NAV: { href: string; label: L }[] = [
  { href: '/proyectos', label: { es: 'Trabajo', en: 'Work' } },
  { href: '/servicios', label: { es: 'Servicios', en: 'Services' } },
  { href: '/#testimonios', label: { es: 'Opiniones', en: 'Reviews' } },
  { href: '/blog', label: { es: 'Blog', en: 'Journal' } },
  { href: '/studio', label: { es: 'El estudio', en: 'Studio' } },
].filter((n) => FORMS_ENABLED || n.href !== '/#testimonios') // the testimonials section is part of the (disabled) forms feature

export const UI = {
  skip: { es: 'Ir al contenido', en: 'Skip to content' },
  menuOpen: { es: 'MENÚ ☰', en: 'MENU ☰' },
  menuClose: { es: 'CERRAR ✕', en: 'CLOSE ✕' },
  start: { es: 'Iniciar proyecto', en: 'Start a project' },
  langLabel: { es: 'Idioma', en: 'Language' },
  navLabel: { es: 'Navegación principal', en: 'Main navigation' },
  homeLabel: { es: 'DeepSun Studio, inicio', en: 'DeepSun Studio, home' },
  caseStudy: { es: 'Explorar el caso', en: 'Explore case study' },
  problem: { es: 'Problema', en: 'Problem' },
  solution: { es: 'Solución', en: 'Solution' },
  result: { es: 'Resultado', en: 'Outcome' },
  delivered: { es: 'Lo que entregamos', en: 'What we delivered' },
  nextCase: { es: 'Siguiente caso', en: 'Next case' },
  prevCase: { es: 'Caso anterior', en: 'Previous case' },
  allWork: { es: 'Todo el trabajo', en: 'All work' },
  liveSite: { es: 'Ver sitio en vivo', en: 'View live site' },
  related: { es: 'Más casos', en: 'More work' },
  readArticle: { es: 'Leer artículo', en: 'Read article' },
  visitBlog: { es: 'Explorar el blog', en: 'Visit the blog' },
  letsTalk: { es: 'Conversemos', en: "Let's talk" },
  back: { es: 'Volver arriba ↑', en: 'Back to top ↑' },
  clientPortal: { es: 'Portal de clientes', en: 'Client portal' },
}

export const HERO = {
  meta: { es: 'ESTUDIO DIGITAL INDEPENDIENTE<br>RIOHACHA, COLOMBIA — LATAM', en: 'INDEPENDENT DIGITAL STUDIO<br>RIOHACHA, COLOMBIA — LATAM' },
  avail: { es: 'DISPONIBLES PARA NUEVOS PROYECTOS', en: 'OPEN FOR NEW PROJECTS' },
  l1: { es: 'DEL CAOS', en: 'FROM CHAOS' },
  l2: { es: 'A LO', en: 'TO' },
  l3: { es: 'CLARO', en: 'CLARITY' },
  desc: {
    es: 'Transformamos ideas complejas en experiencias digitales que la gente entiende, usa y recuerda.',
    en: 'We turn complex ideas into digital experiences people understand, use and remember.',
  },
  cta: { es: 'Explorar nuestro trabajo', en: 'Explore our work' },
  scroll: { es: 'SCROLL PARA EXPLORAR', en: 'SCROLL TO EXPLORE' },
  marquee: {
    es: 'IDEAS CON PROPÓSITO <b>✳</b> DISEÑO DIGITAL <b>✳</b> DESARROLLO WEB <b>✳</b> SOFTWARE A MEDIDA <b>✳</b> AUTOMATIZACIÓN <b>✳</b>',
    en: 'PURPOSEFUL IDEAS <b>✳</b> DIGITAL DESIGN <b>✳</b> WEB DEVELOPMENT <b>✳</b> CUSTOM SOFTWARE <b>✳</b> AUTOMATION <b>✳</b>',
  },
}

export const INTRO = {
  eyebrow: { es: '01 / NUESTRA FORMA DE VERLO', en: '01 / OUR POINT OF VIEW' },
  tag: { es: 'MENOS RUIDO. MÁS INTENCIÓN.', en: 'LESS NOISE. MORE INTENTION.' },
  statement: {
    es: 'Hay ideas que merecen <em>salir a la luz.</em> Nosotros las hacemos funcionar.',
    en: 'Some ideas deserve to <em>see the light.</em> We make them work.',
  },
  body: {
    es: 'Somos DeepSun Studio: un estudio independiente que diseña y desarrolla experiencias digitales. Mezclamos criterio visual, ingeniería y una obsesión saludable por los detalles.',
    en: 'We are DeepSun Studio, an independent studio designing and building digital experiences. We combine visual judgment, engineering and an almost unreasonable attention to detail.',
  },
  seal: { es: 'BUEN DISEÑO.<br>BUENA INGENIERÍA.<br>SIN COMPLICACIONES.', en: 'GOOD DESIGN.<br>GOOD ENGINEERING.<br>NO COMPLICATIONS.' },
  // Figures already published on the current site. Keep in sync with /studio; verify before launch.
  proof: [
    { n: '10+', label: { es: 'Proyectos indicados en la web', en: 'Projects shown on our site' } },
    { n: '6+', label: { es: 'Clientes indicados en la web', en: 'Clients shown on our site' } },
    { n: '3+', label: { es: 'Años de experiencia declarados', en: 'Years of experience stated' } },
  ],
  proofLabel: { es: 'Cifras publicadas por el estudio', en: 'Figures published by the studio' },
}

export type Cat = 'client' | 'system' | 'automation'

export interface CaseMeta {
  slug: string
  cat: Cat
  visual: 'lufe' | 'fund' | 'siepa' | 'cima' | 'scraper' | 'users'
  kind: L
  pitch: L
  /** Display title with explicit line breaks (uppercase via CSS). */
  title: { es: string; en: string }
}

// Short pitches come from the editorial prototype; long-form case text comes from data/portfolio.ts.
export const CASES: CaseMeta[] = [
  {
    slug: 'lufe-art-tattoo', cat: 'client', visual: 'lufe',
    kind: { es: 'EXPERIENCIA WEB', en: 'WEB EXPERIENCE' },
    title: { es: 'LUFE ART<br>TATTOO', en: 'LUFE ART<br>TATTOO' },
    pitch: {
      es: 'Un espacio digital donde el trabajo de los artistas toma protagonismo y reservar se siente natural.',
      en: "A digital space where the artists' work takes center stage and booking feels effortless.",
    },
  },
  {
    slug: 'fundacion-vida-amor-salud', cat: 'client', visual: 'fund',
    kind: { es: 'PLATAFORMA DIGITAL', en: 'DIGITAL PLATFORM' },
    title: { es: 'FUNDACIÓN<br>VIDA AMOR<br>Y SALUD', en: 'VIDA AMOR<br>Y SALUD<br>FOUNDATION' },
    pitch: {
      es: 'Una presencia digital cálida y accesible para conectar a una fundación con su comunidad.',
      en: 'A welcoming, accessible digital presence that connects a foundation with its community.',
    },
  },
  {
    slug: 'siepa', cat: 'system', visual: 'siepa',
    kind: { es: 'SOFTWARE A MEDIDA', en: 'CUSTOM SOFTWARE' },
    title: { es: 'SIEPA', en: 'SIEPA' },
    pitch: {
      es: 'Un sistema administrativo que reemplaza procesos dispersos por información organizada y útil.',
      en: 'An administrative platform that replaces scattered processes with structured, actionable information.',
    },
  },
  {
    slug: 'premios-la-cima', cat: 'client', visual: 'cima',
    kind: { es: 'PLATAFORMA DE EVENTOS', en: 'EVENT PLATFORM' },
    title: { es: 'PREMIOS<br>LA CIMA', en: 'PREMIOS<br>LA CIMA' },
    pitch: {
      es: 'Una plataforma editorial para un evento de premiación con categorías, nominados e identidad propia.',
      en: 'An editorial platform for an awards event with categories, nominees and an unmistakable identity.',
    },
  },
  {
    slug: 'scraper-app-gui', cat: 'automation', visual: 'scraper',
    kind: { es: 'AUTOMATIZACIÓN / 2024', en: 'AUTOMATION / 2024' },
    title: { es: 'SCRAPER APP GUI', en: 'SCRAPER APP GUI' },
    pitch: {
      es: 'Herramienta de escritorio para extraer información web sin programar.',
      en: 'Desktop tool for no-code web data collection and exports.',
    },
  },
  {
    slug: 'ms-usuarios', cat: 'system', visual: 'users',
    kind: { es: 'ACCESO SEGURO / 2024', en: 'SECURE ACCESS / 2024' },
    title: { es: 'MS-USUARIOS', en: 'MS-USUARIOS' },
    pitch: {
      es: 'Una solución de acceso seguro con permisos adecuados para cada usuario.',
      en: 'A secure access solution that gives each user the right permissions.',
    },
  },
]

export const WORK = {
  eyebrow: { es: '02 / LO QUE CONSTRUIMOS', en: '02 / WHAT WE BUILD' },
  title: { es: 'TRABAJO<br>REAL.', en: 'REAL<br>WORK.' },
  intro: {
    es: 'Cada proyecto tiene una historia diferente. Nuestra tarea es encontrar la forma más clara de contarla y hacerla funcionar.',
    en: 'Each project tells a different story. Our job is to find the clearest way to tell it — and make it work.',
  },
  filters: {
    all: { es: 'TODOS', en: 'ALL WORK' },
    client: { es: 'CLIENTES', en: 'CLIENTS' },
    system: { es: 'SISTEMAS', en: 'SYSTEMS' },
    automation: { es: 'AUTOMATIZACIÓN', en: 'AUTOMATION' },
  } as Record<'all' | Cat, L>,
  filterLabel: { es: 'Filtrar proyectos', en: 'Filter projects' },
  note: {
    es: 'Los gráficos son reinterpretaciones conceptuales, no capturas de los productos entregados.',
    en: 'Visuals are conceptual interpretations, not screenshots of delivered products.',
  },
  seeAll: { es: 'Ver todos los proyectos', en: 'See all projects' },
  featuredHome: ['lufe-art-tattoo', 'fundacion-vida-amor-salud', 'siepa', 'premios-la-cima'],
}

export const SERVICES = {
  eyebrow: { es: '04 / LO QUE HACEMOS', en: '04 / WHAT WE DO' },
  title: { es: 'SOLUCIONES<br><em>sin vueltas.</em>', en: 'SOLUTIONS<br><em>without fuss.</em>' },
  intro: {
    es: 'No necesitas saber cómo funciona la tecnología. Necesitas que funcione para ti. De eso nos encargamos.',
    en: "You don't need to know how technology works. You need it to work for you. That's our job.",
  },
  items: [
    { name: { es: 'Sitios web', en: 'Websites' }, desc: { es: 'Presencias digitales con carácter, rápidas y fáciles de usar.', en: 'Fast, expressive and easy-to-use digital experiences.' } },
    { name: { es: 'Software a medida', en: 'Custom software' }, desc: { es: 'Herramientas pensadas para cómo funciona tu negocio.', en: 'Tools built around how your business actually works.' } },
    { name: { es: 'Automatización', en: 'Automation' }, desc: { es: 'Menos tareas repetitivas. Más tiempo para lo importante.', en: 'Fewer repetitive tasks, more time for what matters.' } },
    { name: { es: 'Diseño digital', en: 'Digital design' }, desc: { es: 'Experiencias claras que conectan con personas reales.', en: 'Clear experiences that connect with real people.' } },
  ],
  cta: { es: '¿NO SABES QUÉ NECESITAS TODAVÍA?<br>TE AYUDAMOS A DESCUBRIRLO.', en: "NOT SURE WHAT YOU NEED YET?<br>WE'LL FIGURE IT OUT TOGETHER." },
  ctaBtn: { es: 'Hablemos de tu idea', en: 'Tell us about your idea' },
}

export const METHOD = {
  eyebrow: { es: '06 / ASÍ TRABAJAMOS', en: '06 / HOW WE WORK' },
  title: { es: "CERO MISTERIO.<br><span class='italic'>Todo claro.</span>", en: "NO MYSTERY.<br><span class='italic'>All clear.</span>" },
  steps: [
    { n: { es: '01 / ESCUCHAR', en: '01 / LISTEN' }, h: { es: 'Tu idea.', en: 'Your idea.' }, p: { es: 'Entendemos el problema, el objetivo y lo que realmente necesitas.', en: 'We understand the problem, the goal and what you actually need.' } },
    { n: { es: '02 / PROPONER', en: '02 / PROPOSE' }, h: { es: 'Un plan.', en: 'A plan.' }, p: { es: 'Acordamos alcance, entregables, etapas y condiciones.', en: 'We agree on scope, deliverables, stages and terms.' } },
    { n: { es: '03 / CONSTRUIR', en: '03 / BUILD' }, h: { es: 'En marcha.', en: 'In motion.' }, p: { es: 'Diseñamos, desarrollamos y compartimos avances.', en: 'We design, develop and share progress.' } },
    { n: { es: '04 / ENTREGAR', en: '04 / DELIVER' }, h: { es: 'A la luz.', en: 'Into the light.' }, p: { es: 'Publicamos, explicamos y dejamos todo listo para usar.', en: "We ship, explain and make sure it's ready to use." } },
  ],
}

export const REVIEWS = {
  eyebrow: { es: '03 / SUS PALABRAS', en: '03 / THEIR WORDS' },
  title: { es: 'LAS PERSONAS<br>DETRÁS DE LOS <em>PROYECTOS.</em>', en: 'THE PEOPLE<br>BEHIND THE <em>PROJECTS.</em>' },
  lead: {
    es: 'El buen trabajo habla por sí mismo. La voz de quienes confiaron en nosotros habla aún más. Aquí aparecen las opiniones aprobadas de nuestros clientes.',
    en: 'Good work speaks for itself. Real feedback speaks even louder. This space shows approved reviews from our clients.',
  },
  leave: { es: 'Deja tu experiencia', en: 'Leave your review' },
  emptyTag: { es: 'TESTIMONIOS / SOLO CONTENIDO APROBADO', en: 'TESTIMONIALS / APPROVED CONTENT ONLY' },
  emptyQuote: { es: 'Cada gran proyecto empieza por <em>la confianza.</em>', en: 'Every meaningful project begins with <em>trust.</em>' },
  emptyBody: {
    es: 'Todavía no hay opiniones publicadas. Si trabajaste con nosotros, tu experiencia puede ser la primera. Cada opinión se revisa antes de publicarse.',
    en: 'There are no published reviews yet. If we worked together, yours could be the first. Every review is moderated before it appears.',
  },
  noFake: { es: 'SIN OPINIONES INVENTADAS', en: 'NO MADE-UP REVIEWS' },
  note: { es: 'Opiniones reales · Publicaciones moderadas · Carrusel accesible', en: 'Real client reviews · Moderated submissions · Accessible carousel' },
  loadError: { es: 'No pudimos cargar las opiniones en este momento.', en: "We couldn't load reviews right now." },
  loading: { es: 'Cargando opiniones…', en: 'Loading reviews…' },
  prev: { es: 'Opinión anterior', en: 'Previous review' },
  next: { es: 'Siguiente opinión', en: 'Next review' },
  carousel: { es: 'Carrusel de opiniones', en: 'Reviews carousel' },
  watchVideo: { es: 'Ver video', en: 'Watch video' },
  viewImage: { es: 'Ver imagen', en: 'View image' },
}

export const PLANS_SECTION = {
  eyebrow: { es: '05 / SERVICIOS Y PLANES', en: '05 / SERVICES & PRICING' },
  title: { es: 'CLARO<br>DESDE EL DÍA UNO.', en: 'CLEAR<br>FROM DAY ONE.' },
  intro: {
    es: 'Cuatro formas de trabajar juntos. El alcance, los plazos y la inversión se definen contigo en una propuesta.',
    en: 'Four ways of working together. Scope, timing and investment are defined with you in a proposal.',
  },
  from: { es: 'Desde', en: 'From' },
  quote: { es: 'A COTIZAR', en: 'QUOTE' },
  quoteNote: { es: 'Precio según complejidad del proyecto', en: 'Priced according to project complexity' },
  idealFor: { es: 'Ideal para', en: 'Ideal for' },
  priceIn: { es: 'Precios en', en: 'Prices in' },
  currencyLabel: { es: 'Seleccionar moneda', en: 'Select currency' },
  rateNote: {
    es: 'Conversión aproximada de referencia (1 USD = 4.200 COP / 0,92 EUR), pendiente de verificar con una fuente de cambio.',
    en: 'Approximate reference conversion (1 USD = 4,200 COP / 0.92 EUR), pending verification against an exchange-rate source.',
  },
  commonQuestions: { es: 'PREGUNTAS FRECUENTES', en: 'COMMON QUESTIONS' },
  faqTitle: { es: 'SIN LETRA<br>PEQUEÑA.', en: 'NO SMALL<br>PRINT.' },
  finalTitle: { es: '¿Tienes dudas sobre cuál plan es el tuyo?', en: 'Not sure which plan fits?' },
  finalBody: {
    es: 'Escríbenos y te ayudamos a definir qué necesita tu negocio — sin compromiso.',
    en: 'Write to us and we will help you work out what your business needs — no commitment.',
  },
}

export interface PlanCopy {
  key: string
  usd: number | null
  idx: L
  name: L
  headline: L
  features: { es: string[]; en: string[] }
  ideal: L
  cta: L
}

/**
 * LAUNCH 1.0 plans: scope only. No prices, page counts, revision rounds, delivery times, support terms or "24/7" promises, because none of
 * that is verified. Pricing and terms are agreed in a proposal (WhatsApp). The previous full copy is kept in PLANS_FULL below.
 */
export const PLANS: PlanCopy[] = [
  {
    key: 'basica', usd: null,
    idx: { es: '01 / EMPEZAR', en: '01 / START HERE' },
    name: { es: 'Presencia Básica', en: 'Basic Presence' },
    headline: { es: 'Para el negocio que necesita existir en internet ya.', en: 'For the business that needs to exist online now.' },
    features: {
      es: ['Sitio web a la medida de tu negocio', 'Diseño responsive pensado primero para móvil', 'SEO básico', 'Integración con WhatsApp'],
      en: ['A website tailored to your business', 'Mobile-first responsive design', 'Basic SEO', 'WhatsApp integration'],
    },
    ideal: { es: 'Restaurantes, tiendas, consultorios, negocios locales', en: 'Restaurants, shops, practices, local businesses' },
    cta: { es: 'Cotizar por WhatsApp', en: 'Get a quote on WhatsApp' },
  },
  {
    key: 'profesional', usd: null,
    idx: { es: '02 / CRECER', en: '02 / GROW FURTHER' },
    name: { es: 'Presencia Profesional', en: 'Professional Presence' },
    headline: { es: 'Para el negocio que quiere liderar su mercado digital.', en: 'For the business that wants to lead its digital market.' },
    features: {
      es: ['Todo lo del plan Básico', 'Sitio web de mayor alcance', 'SEO avanzado con palabras clave locales', 'Blog integrado', 'Bot básico de WhatsApp', 'Google Business Profile', 'Analítica y seguimiento de conversiones'],
      en: ['Everything in Basic', 'A larger website', 'Advanced SEO with local keywords', 'Built-in blog', 'Basic WhatsApp bot', 'Google Business Profile', 'Analytics and conversion tracking'],
    },
    ideal: { es: 'Hoteles, clínicas, empresas establecidas, instituciones', en: 'Hotels, clinics, established companies, institutions' },
    cta: { es: 'Cotizar por WhatsApp', en: 'Get a quote on WhatsApp' },
  },
  {
    key: 'automatizacion', usd: null,
    idx: { es: '03 / AUTOMATIZACIÓN', en: '03 / AUTOMATION' },
    name: { es: 'Automatización & Bots', en: 'Automation & Bots' },
    headline: { es: 'Para el negocio que pierde tiempo respondiendo lo mismo todos los días.', en: 'For the business that loses time answering the same things every day.' },
    features: {
      es: ['Bot de WhatsApp personalizado', 'Respuestas automáticas', 'Flujos de ventas automatizados', 'Agendamiento automático', 'Integración con tu sistema actual', 'Panel de control para gestionar el bot', 'Capacitación de uso'],
      en: ['Custom WhatsApp bot', 'Automatic replies', 'Automated sales flows', 'Automatic scheduling', 'Integration with your current system', 'Control panel to manage the bot', 'Usage training'],
    },
    ideal: { es: 'Cualquier negocio con alto volumen de mensajes de WhatsApp', en: 'Any business with a high volume of WhatsApp messages' },
    cta: { es: 'Cotizar por WhatsApp', en: 'Get a quote on WhatsApp' },
  },
  {
    key: 'medida', usd: null,
    idx: { es: '04 / A MEDIDA', en: '04 / MADE TO FIT' },
    name: { es: 'Software a Medida', en: 'Custom Software' },
    headline: { es: 'Tu negocio es único. Tu software también debería serlo.', en: 'Your business is unique. Your software should be too.' },
    features: {
      es: ['Plataformas administrativas', 'Sistemas de gestión (ERP / CRM)', 'Dashboards y analíticas', 'APIs e integraciones', 'Automatizaciones complejas', 'E-commerce personalizado', 'Apps web progresivas (PWA)'],
      en: ['Administrative platforms', 'Management systems (ERP / CRM)', 'Dashboards and analytics', 'APIs and integrations', 'Complex automations', 'Custom e-commerce', 'Progressive web apps (PWA)'],
    },
    ideal: { es: 'Proceso: diagnóstico → propuesta → cotización → desarrollo por etapas', en: 'Process: diagnosis → proposal → quote → staged development' },
    cta: { es: 'Solicitar cotización', en: 'Request a quote' },
  },
]

/** NOT PUBLISHED. Previous plan copy with prices (US$600 / 1,500 / 800), page counts, revision rounds, delivery times and support terms.
 *  Kept to restore once the owner confirms every figure and term. */
export const PLANS_FULL: PlanCopy[] = [
  {
    key: 'basica', usd: 600,
    idx: { es: '01 / EMPEZAR', en: '01 / START HERE' },
    name: { es: 'Presencia Básica', en: 'Basic Presence' },
    headline: { es: 'Para el negocio que necesita existir en internet ya.', en: 'For the business that needs to exist online now.' },
    features: {
      es: ['Sitio web hasta 5 páginas', 'Diseño responsive mobile-first', 'SEO básico (aparecer en Google)', 'Formulario de contacto', 'Integración WhatsApp', '1 ronda de revisiones', 'Entrega en 7–10 días', 'Dominio y hosting (primer año)'],
      en: ['Website up to 5 pages', 'Mobile-first responsive design', 'Basic SEO (show up on Google)', 'Contact form', 'WhatsApp integration', '1 round of revisions', 'Delivery in 7–10 days', 'Domain and hosting (first year)'],
    },
    ideal: { es: 'Restaurantes, tiendas, consultorios, negocios locales', en: 'Restaurants, shops, practices, local businesses' },
    cta: { es: 'Quiero este plan', en: 'I want this plan' },
  },
  {
    key: 'profesional', usd: 1500,
    idx: { es: '02 / CRECER', en: '02 / GROW FURTHER' },
    name: { es: 'Presencia Profesional', en: 'Professional Presence' },
    headline: { es: 'Para el negocio que quiere liderar su mercado digital.', en: 'For the business that wants to lead its digital market.' },
    features: {
      es: ['Todo lo del plan Básico', 'Sitio web hasta 12 páginas', 'SEO avanzado con keywords locales', 'Blog integrado', 'WhatsApp bot básico', 'Google Business Profile configurado', 'Analytics y seguimiento de conversiones', '3 rondas de revisiones', 'Entrega en 15–20 días', '1 mes de soporte post-entrega'],
      en: ['Everything in Basic', 'Website up to 12 pages', 'Advanced SEO with local keywords', 'Built-in blog', 'Basic WhatsApp bot', 'Google Business Profile set up', 'Analytics and conversion tracking', '3 rounds of revisions', 'Delivery in 15–20 days', '1 month of post-launch support'],
    },
    ideal: { es: 'Hoteles, clínicas, empresas establecidas, instituciones', en: 'Hotels, clinics, established companies, institutions' },
    cta: { es: 'Quiero este plan', en: 'I want this plan' },
  },
  {
    key: 'automatizacion', usd: 800,
    idx: { es: '03 / AUTOMATIZACIÓN', en: '03 / AUTOMATION' },
    name: { es: 'Automatización & Bots', en: 'Automation & Bots' },
    headline: { es: 'Para el negocio que pierde tiempo respondiendo lo mismo todos los días.', en: 'For the business that loses time answering the same things every day.' },
    features: {
      es: ['Bot de WhatsApp personalizado', 'Respuestas automáticas 24/7', 'Flujos de ventas automatizados', 'Agendamiento automático', 'Integración con tu sistema actual', 'Panel de control para gestionar el bot', 'Capacitación de uso', '1 mes de soporte'],
      en: ['Custom WhatsApp bot', 'Automatic replies 24/7', 'Automated sales flows', 'Automatic scheduling', 'Integration with your current system', 'Control panel to manage the bot', 'Usage training', '1 month of support'],
    },
    ideal: { es: 'Cualquier negocio con alto volumen de mensajes de WhatsApp', en: 'Any business with a high volume of WhatsApp messages' },
    cta: { es: 'Quiero este plan', en: 'I want this plan' },
  },
  {
    key: 'medida', usd: null,
    idx: { es: '04 / A MEDIDA', en: '04 / MADE TO FIT' },
    name: { es: 'Software a Medida', en: 'Custom Software' },
    headline: { es: 'Tu negocio es único. Tu software también debería serlo.', en: 'Your business is unique. Your software should be too.' },
    features: {
      es: ['Plataformas administrativas', 'Sistemas de gestión (ERP / CRM)', 'Dashboards y analíticas', 'APIs e integraciones', 'Automatizaciones complejas', 'E-commerce personalizado', 'Apps web progresivas (PWA)'],
      en: ['Administrative platforms', 'Management systems (ERP / CRM)', 'Dashboards and analytics', 'APIs and integrations', 'Complex automations', 'Custom e-commerce', 'Progressive web apps (PWA)'],
    },
    ideal: { es: 'Proceso: diagnóstico → propuesta → cotización exacta → desarrollo por etapas', en: 'Process: diagnosis → proposal → exact quote → staged development' },
    cta: { es: 'Solicitar cotización gratuita', en: 'Request a free quote' },
  },
]

/** LAUNCH 1.0 FAQ: no delivery times, payment terms or support promises (not verified). Previous copy: FAQ_FULL. */
export const FAQ: { q: L; a: L }[] = [
  { q: { es: '¿Qué necesito para empezar?', en: 'What do I need to get started?' }, a: { es: 'Una idea clara de lo que quieres lograr. Escríbenos por WhatsApp y la vamos definiendo juntos.', en: 'A clear idea of what you want to achieve. Message us on WhatsApp and we will shape it together.' } },
  { q: { es: '¿Cuánto tiempo tarda?', en: 'How long will it take?' }, a: { es: 'Depende del alcance del proyecto. En la propuesta acordamos las etapas y las fechas de entrega.', en: 'It depends on the scope of the project. In the proposal we agree the stages and delivery dates.' } },
  { q: { es: '¿Cómo es el pago?', en: 'How does payment work?' }, a: { es: 'Las condiciones de pago se acuerdan en la propuesta, según el alcance del proyecto.', en: 'Payment terms are agreed in the proposal, according to the scope of the project.' } },
  { q: { es: '¿Qué pasa después de la entrega?', en: 'What happens after delivery?' }, a: { es: 'Lo conversamos en la propuesta: qué acompañamiento necesitas después de publicar.', en: 'We discuss it in the proposal: what support you need after launch.' } },
  { q: { es: '¿Trabajan con negocios fuera de Colombia?', en: 'Do you work with businesses outside Colombia?' }, a: { es: 'Trabajamos de forma remota. Escríbenos por WhatsApp y revisamos tu caso.', en: 'We work remotely. Message us on WhatsApp and we will look at your case.' } },
  { q: { es: '¿Puedo ver trabajos anteriores?', en: 'Can I see previous work?' }, a: { es: 'En la sección de proyectos están los casos de estudio disponibles. Otros casos se publican cuando sus responsables lo autorizan.', en: 'The projects section has the case studies currently available. Other cases are published once their owners authorize it.' } },
]

/** NOT PUBLISHED. Previous FAQ (delivery times, 50/50 payment, post-delivery support, clients in US/Spain). */
export const FAQ_FULL: { q: L; a: L }[] = [
  { q: { es: '¿Qué necesito para empezar?', en: 'What do I need to get started?' }, a: { es: 'Solo necesitas una idea clara de lo que quieres y tu información de contacto. Nosotros nos encargamos del resto.', en: 'You only need a clear idea of what you want and your contact details. We take care of the rest.' } },
  { q: { es: '¿Cuánto tiempo tarda?', en: 'How long will it take?' }, a: { es: 'Depende del plan: desde 7 días para presencia básica hasta 3-4 meses para software personalizado. Siempre con fechas de entrega claras desde el inicio.', en: 'It depends on the plan: from 7 days for a basic presence to 3–4 months for custom software. Always with clear delivery dates from the start.' } },
  { q: { es: '¿Puedo pagar en cuotas?', en: 'Can I pay in installments?' }, a: { es: 'Sí. Trabajamos con 50% al iniciar y 50% al entregar. Para proyectos grandes podemos hacer 3 cuotas.', en: 'Yes. We work with 50% at the start and 50% on delivery. For larger projects we can split it into 3 payments.' } },
  { q: { es: '¿Qué pasa después de la entrega?', en: 'What happens after delivery?' }, a: { es: 'Cada plan incluye soporte post-entrega. Además ofrecemos planes de mantenimiento mensual para quienes lo necesiten.', en: 'Every plan includes post-delivery support. We also offer monthly maintenance plans for those who need them.' } },
  { q: { es: '¿Trabajan con negocios fuera de Colombia?', en: 'Do you work with businesses outside Colombia?' }, a: { es: 'Sí. Trabajamos con clientes en toda Latinoamérica y también con empresas hispanohablantes en Estados Unidos y España.', en: 'Yes. We work with clients across Latin America and with Spanish-speaking companies in the United States and Spain.' } },
  { q: { es: '¿Puedo ver trabajos anteriores?', en: 'Can I see previous work?' }, a: { es: 'Sí, en la sección de proyectos están los casos de estudio con problema, solución y resultado de cada trabajo.', en: 'Yes, the projects section has case studies with the problem, solution and outcome of each piece of work.' } },
]

export const JOURNAL = {
  eyebrow: { es: '07 / DESDE EL ESTUDIO', en: '07 / NOTES FROM THE STUDIO' },
  title: { es: 'IDEAS<br>EN VOZ ALTA.', en: 'IDEAS<br>OUT LOUD.' },
  intro: {
    es: 'Artículos prácticos sobre software, diseño y cómo los negocios pueden aprovechar la tecnología.',
    en: 'Practical articles about software, design and how businesses can make better use of technology.',
  },
  onlySpanish: {
    es: '',
    en: 'Articles are currently published in Spanish only. English versions have not been written yet.',
  },
  min: { es: 'de lectura', en: 'read' },
  empty: { es: 'Aún no hay artículos publicados.', en: 'No articles published yet.' },
  ctaTitle: { es: '¿Necesitas esto para tu negocio?', en: 'Need this for your business?' },
  ctaBody: { es: 'Cuéntanos qué necesitas y te respondemos con claridad y sin palabras de más.', en: 'Tell us what you need and we will reply clearly, without the jargon.' },
  backToBlog: { es: '← Volver al blog', en: '← Back to the blog' },
  shareNote: { es: 'Artículo en español', en: 'Article in Spanish' },
}

export const CONTACT = {
  eyebrow: { es: '08 / EMPECEMOS', en: "08 / LET'S BEGIN" },
  title: { es: 'LO BUENO<br>EMPIEZA CON<br><em>un hola.</em>', en: 'GOOD THINGS<br>START WITH<br><em>a hello.</em>' },
  lead: {
    es: '¿Tienes una idea, un proceso que necesita mejorar o un proyecto en mente? Cuéntanos. Te respondemos con claridad y sin palabras de más.',
    en: "Got an idea, a process that needs fixing, or a project in mind? Tell us. We'll reply clearly, without the jargon.",
  },
  whatsapp: { es: 'WHATSAPP ↗', en: 'WHATSAPP ↗' },
  waText: { es: 'Hola DeepSun, quisiera hablar sobre un proyecto.', en: 'Hi DeepSun, I would like to talk about a project.' },
  fName: { es: '01 / Tu nombre', en: '01 / Your name' },
  fEmail: { es: '02 / Tu correo', en: '02 / Your email' },
  fIdea: { es: '03 / Cuéntanos tu idea', en: '03 / Tell us your idea' },
  phName: { es: '¿Cómo te llamas?', en: "What's your name?" },
  phEmail: { es: 'hola@tucorreo.com', en: 'hello@youremail.com' },
  phIdea: { es: 'Quiero construir algo que...', en: "I'd like to build something that..." },
  send: { es: 'Enviar mensaje', en: 'Send message' },
  sending: { es: 'Enviando…', en: 'Sending…' },
  ok: { es: 'Recibido. Te respondemos pronto.', en: "Received. We'll get back to you soon." },
  err: { es: 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por correo.', en: "We couldn't send your message. Try again or email us." },
  invalid: { es: 'Revisa tu nombre, un correo válido y una idea de al menos 10 caracteres.', en: 'Check your name, a valid email and an idea of at least 10 characters.' },
  dup: { es: 'Ya habíamos recibido este mensaje. Te respondemos pronto.', en: 'We had already received this message. We will get back to you soon.' },
  limit: { es: 'Recibimos muchas solicitudes desde tu conexión. Inténtalo más tarde o escríbenos por correo.', en: 'We received many requests from your connection. Try again later or email us.' },
  fullBrief: { es: 'FORMULARIO COMPLETO', en: 'FULL PROJECT BRIEF' },
  fullTitle: { es: 'Cuéntanos el proyecto completo.', en: 'Tell us the whole story.' },
  fullBody: { es: 'Cinco pasos breves: tipo de negocio, necesidades, presupuesto, plazo y tus datos.', en: 'Five short steps: business type, needs, budget, timeline and your details.' },
  fullCta: { es: 'Abrir el formulario', en: 'Open the project brief' },
  privacy: { es: 'Usamos tus datos solo para responderte sobre tu proyecto.', en: 'We use your details only to reply about your project.' },
}

export const FOOTER = {
  note: {
    es: 'ESTUDIO DIGITAL INDEPENDIENTE.<br>RIOHACHA, COLOMBIA. TRABAJANDO PARA DONDE SEA QUE SURJAN BUENAS IDEAS.',
    en: 'INDEPENDENT DIGITAL STUDIO.<br>RIOHACHA, COLOMBIA. WORKING WHEREVER GREAT IDEAS BEGIN.',
  },
  tag: { es: 'HECHO PARA BRILLAR, DISEÑADO PARA FUNCIONAR.', en: 'MADE TO SHINE. DESIGNED TO WORK.' },
  links: [
    { href: '/proyectos', label: { es: 'Proyectos', en: 'Work' } },
    { href: '/servicios', label: { es: 'Servicios', en: 'Services' } },
    { href: '/#testimonios', label: { es: 'Testimonios', en: 'Testimonials' } },
    { href: '/blog', label: { es: 'Blog', en: 'Blog' } },
    { href: '/studio', label: { es: 'El estudio', en: 'Studio' } },
    { href: '/contacto', label: { es: 'Contacto', en: 'Contact' } },
  ].filter((l) => FORMS_ENABLED || l.href !== '/#testimonios'),
}

export const STUDIO = {
  eyebrow: { es: 'EL ESTUDIO', en: 'THE STUDIO' },
  title: { es: 'NO SOMOS<br>UNA AGENCIA<br><em>más.</em>', en: 'NOT JUST<br>ANOTHER<br><em>agency.</em>' },
  lead: {
    es: 'Somos un estudio digital independiente. Construimos presencia digital real para negocios que quieren crecer — no solo verse bien en internet. Desde Riohacha para Colombia y el mundo.',
    en: 'We are an independent digital studio. We build real digital presence for businesses that want to grow — not just look good online. From Riohacha, for Colombia and the world.',
  },
  problemEyebrow: { es: '01 / EL PROBLEMA QUE RESOLVEMOS', en: '01 / THE PROBLEM WE SOLVE' },
  problemTitle: { es: '¿TU NEGOCIO<br>EXISTE EN <em>internet?</em>', en: 'DOES YOUR<br>BUSINESS EXIST <em>online?</em>' },
  problems: [
    { h: { es: 'Tu competencia aparece. Tú no.', en: 'Your competition shows up. You do not.' }, p: { es: 'Cuando un cliente busca lo que vendes en Google, aparece tu competencia. Cada día sin presencia digital es un cliente que se va con otro.', en: 'When a customer searches for what you sell, your competitors show up. Every day without a digital presence is a customer who goes elsewhere.' } },
    { h: { es: 'Tus clientes buscan desde el celular.', en: 'Your customers search on their phones.' }, p: { es: 'Si tu sitio no está pensado para el celular, estás perdiendo a una parte importante de tus clientes potenciales.', en: 'If your site is not designed for mobile, you are losing a large share of potential customers.' } },
    { h: { es: 'Responder a mano agota tu tiempo.', en: 'Answering by hand drains your time.' }, p: { es: 'Responder los mismos mensajes todos los días, cobrar manualmente, agendar por Instagram: todo eso se puede automatizar. Tu tiempo vale más.', en: 'Answering the same messages daily, collecting payments by hand, booking through Instagram: all of it can be automated. Your time is worth more.' } },
  ],
  whoEyebrow: { es: '02 / QUIÉNES SOMOS', en: '02 / WHO WE ARE' },
  whoTitle: { es: 'DIRECTO<br>AL GRANO, <em>sin intermediarios.</em>', en: 'STRAIGHT<br>TO THE POINT, <em>no middlemen.</em>' },
  who1: {
    es: 'DeepSun Studio nació en Riohacha, La Guajira, con una misión clara: que los negocios colombianos tengan la misma presencia digital que las grandes empresas, sin pagar precios de gran empresa.',
    en: 'DeepSun Studio began in Riohacha, La Guajira, with a clear mission: for Colombian businesses to have the same digital presence as large companies, without large-company prices.',
  },
  who2: {
    es: 'Joshua Navarro dirige cada proyecto. Hablas directamente con quien construye tu solución.',
    en: 'Joshua Navarro leads every project. You talk directly to the person building your solution.',
  },
  figures: { es: 'Cifras publicadas por el estudio · por verificar antes del lanzamiento', en: 'Figures published by the studio · to verify before launch' },
  stats: [
    { n: '10+', l: { es: 'Proyectos indicados', en: 'Projects shown' } },
    { n: '6+', l: { es: 'Clientes indicados', en: 'Clients shown' } },
    { n: '3+', l: { es: 'Años de experiencia', en: 'Years of experience' } },
  ],
  sectorsEyebrow: { es: '03 / SECTORES', en: '03 / SECTORS' },
  sectorsTitle: { es: 'SECTORES DONDE<br>PODEMOS <em>ayudar.</em>', en: 'SECTORS WHERE<br>WE CAN <em>help.</em>' },
  sectors: [
    { n: { es: 'Hoteles y turismo', en: 'Hotels and tourism' }, d: { es: 'Que tu hotel aparezca cuando alguien busca dónde alojarse en La Guajira.', en: 'So your hotel shows up when someone looks for a place to stay in La Guajira.' } },
    { n: { es: 'Clínicas y salud', en: 'Clinics and health' }, d: { es: 'Pacientes que te encuentran en Google antes de llamar.', en: 'Patients who find you on Google before they call.' } },
    { n: { es: 'Restaurantes y comida', en: 'Restaurants and food' }, d: { es: 'Menú digital, reservas online y pedidos por WhatsApp.', en: 'Digital menus, online booking and WhatsApp orders.' } },
    { n: { es: 'Firmas y consultorios', en: 'Firms and practices' }, d: { es: 'Credibilidad profesional desde el primer clic.', en: 'Professional credibility from the first click.' } },
    { n: { es: 'Instituciones educativas', en: 'Educational institutions' }, d: { es: 'Matrículas, comunicados y pagos en un solo lugar.', en: 'Enrollment, announcements and payments in one place.' } },
    { n: { es: 'Empresas y fundaciones', en: 'Companies and foundations' }, d: { es: 'Sistemas y presencia digital que escalan con tu organización.', en: 'Systems and digital presence that scale with your organization.' } },
  ],
  otherSector: { es: '¿Tu sector no está aquí? Igual podemos ayudarte.', en: "Your sector isn't here? We can still help." },
  ctaTitle: { es: 'CUÉNTANOS<br>TU <em>caso.</em>', en: 'TELL US<br>YOUR <em>case.</em>' },
}

export const PROJECTS_PAGE = {
  eyebrow: { es: 'PROYECTOS', en: 'PROJECTS' },
  title: { es: 'TRABAJO<br>REAL, <em>con historia.</em>', en: 'REAL WORK,<br><em>with a story.</em>' },
  intro: {
    es: 'Casos de estudio. Para cada uno: el problema, la solución y lo que se construyó.',
    en: 'Case studies. For each one: the problem, the solution and what was built.',
  },
  clientBadge: { es: 'Proyecto de cliente', en: 'Client project' },
  ownBadge: { es: 'Proyecto propio', en: 'In-house project' },
  year: { es: 'Año', en: 'Year' },
  client: { es: 'Cliente', en: 'Client' },
  next: { es: 'Siguiente caso', en: 'Next case' },
  ctaTitle: { es: '¿TIENES UN<br>PROYECTO <em>así?</em>', en: 'GOT A PROJECT<br>LIKE <em>this?</em>' },
}

export const BLOG_PAGE = {
  eyebrow: { es: 'BLOG', en: 'JOURNAL' },
  title: { es: 'IDEAS<br>EN <em>voz alta.</em>', en: 'IDEAS<br>OUT <em>loud.</em>' },
  all: { es: 'Todos', en: 'All' },
}

export const BRIEF = {
  eyebrow: { es: 'CONTACTO', en: 'CONTACT' },
  title: { es: 'CUÉNTANOS<br>TU <em>proyecto.</em>', en: 'TELL US<br>ABOUT YOUR <em>project.</em>' },
  intro: {
    es: 'Cinco pasos breves. Te respondemos con claridad y sin palabras de más.',
    en: 'Five short steps. We reply clearly, without the jargon.',
  },
  step: { es: 'Paso', en: 'Step' },
  of: { es: 'de', en: 'of' },
  back: { es: '← Atrás', en: '← Back' },
  next: { es: 'Continuar →', en: 'Continue →' },
  q1: { es: '¿Qué tipo de negocio tienes?', en: 'What kind of business do you have?' },
  q1h: { es: 'Selecciona el que más se acerca.', en: 'Pick the closest match.' },
  q2: { es: '¿Qué necesitas?', en: 'What do you need?' },
  q2h: { es: 'Puedes seleccionar varias opciones.', en: 'You can pick several.' },
  q3: { es: '¿Cuál es tu presupuesto aproximado?', en: "What's your approximate budget?" },
  q3h: { es: 'Sin compromiso. Nos ayuda a ofrecerte la mejor solución.', en: 'No commitment. It helps us suggest the right solution.' },
  q4: { es: '¿Para cuándo lo necesitas?', en: 'When do you need it?' },
  q4h: { es: 'Nos permite planificar mejor tu proyecto.', en: 'It helps us plan your project better.' },
  q5: { es: 'Tus datos', en: 'Your details' },
  q5h: { es: 'Solo pedimos lo esencial.', en: 'We only ask for the essentials.' },
  name: { es: 'Nombre completo', en: 'Full name' },
  email: { es: 'Correo electrónico', en: 'Email' },
  wa: { es: 'WhatsApp (opcional)', en: 'WhatsApp (optional)' },
  msg: { es: 'Cuéntanos más sobre tu proyecto', en: 'Tell us more about your project' },
  submit: { es: 'Enviar solicitud', en: 'Send request' },
  sending: { es: 'Enviando…', en: 'Sending…' },
  required: { es: 'Nombre y un correo válido son obligatorios.', en: 'A name and a valid email are required.' },
  error: { es: 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por correo.', en: "We couldn't send your request. Try again or email us." },
  throttled: { es: 'Espera unos segundos antes de reenviar.', en: 'Please wait a few seconds before sending again.' },
  limit: { es: 'Recibimos muchas solicitudes desde tu conexión. Inténtalo más tarde o escríbenos por correo.', en: 'We received many requests from your connection. Try again later or email us.' },
  rejected: { es: 'Alguno de los datos no es válido. Revísalos e inténtalo de nuevo.', en: 'Some of the details are not valid. Check them and try again.' },
  doneDup: { es: 'Ya habíamos recibido esta solicitud. Te respondemos pronto con un primer paso concreto.', en: 'We had already received this request. We will reply soon with a concrete first step.' },
  doneTitle: { es: 'Recibido.', en: 'Received.' },
  doneBody: { es: 'Tu solicitud llegó. Te respondemos pronto con un primer paso concreto.', en: 'Your request arrived. We will reply soon with a concrete first step.' },
  urgent: { es: '¿Necesitas respuesta urgente?', en: 'Need a quick answer?' },
  business: [
    { v: 'hotel', l: { es: 'Hotel / Turismo', en: 'Hotel / Tourism' } },
    { v: 'salud', l: { es: 'Salud / Clínica', en: 'Health / Clinic' } },
    { v: 'restaurante', l: { es: 'Restaurante / Comida', en: 'Restaurant / Food' } },
    { v: 'consultorio', l: { es: 'Firma / Consultorio', en: 'Firm / Practice' } },
    { v: 'educacion', l: { es: 'Educación', en: 'Education' } },
    { v: 'empresa', l: { es: 'Empresa / Startup', en: 'Company / Startup' } },
    { v: 'comercio', l: { es: 'Comercio / Tienda', en: 'Retail / Shop' } },
    { v: 'otro', l: { es: 'Otro', en: 'Other' } },
  ],
  needs: [
    { v: 'sitio_nuevo', l: { es: 'Sitio web nuevo', en: 'New website' } },
    { v: 'mejorar', l: { es: 'Mejorar sitio existente', en: 'Improve existing site' } },
    { v: 'whatsapp_bot', l: { es: 'WhatsApp bot', en: 'WhatsApp bot' } },
    { v: 'sistema', l: { es: 'Sistema a medida', en: 'Custom system' } },
    { v: 'seo', l: { es: 'SEO / Posicionamiento', en: 'SEO / Visibility' } },
    { v: 'asesoria', l: { es: 'Asesoría digital', en: 'Digital consulting' } },
  ],
  budgets: [
    { v: 'menos_500', l: { es: 'Menos de $500 USD', en: 'Under $500 USD' } },
    { v: '500_1500', l: { es: '$500 – $1.500 USD', en: '$500 – $1,500 USD' } },
    { v: '1500_3000', l: { es: '$1.500 – $3.000 USD', en: '$1,500 – $3,000 USD' } },
    { v: 'mas_3000', l: { es: 'Más de $3.000 USD', en: 'Over $3,000 USD' } },
    { v: 'no_se', l: { es: 'No lo sé todavía', en: "I don't know yet" } },
  ],
  timelines: [
    { v: 'asap', l: { es: 'Lo antes posible', en: 'As soon as possible' } },
    { v: 'mes', l: { es: 'En el próximo mes', en: 'Within the next month' } },
    { v: '2_3_meses', l: { es: 'En 2–3 meses', en: 'In 2–3 months' } },
    { v: 'explorando', l: { es: 'Estoy explorando opciones', en: "I'm exploring options" } },
  ],
}

export const REVIEW_FORM = {
  title: { es: 'TU EXPERIENCIA CUENTA.', en: 'YOUR EXPERIENCE MATTERS.' },
  eyebrow: { es: 'VOCES REALES', en: 'CLIENT STORIES' },
  intro: { es: 'Tu opinión se revisa antes de publicarse.', en: 'Your review is moderated before it is published.' },
  close: { es: 'Cerrar', en: 'Close' },
  name: { es: 'Tu nombre', en: 'Your name' },
  company: { es: 'Empresa (opcional)', en: 'Company (optional)' },
  role: { es: 'Cargo (opcional)', en: 'Role (optional)' },
  rating: { es: 'Tu valoración', en: 'Your rating' },
  message: { es: 'Cuéntanos cómo fue trabajar juntos', en: 'Tell us what working together was like' },
  avatar: { es: 'Foto (opcional, máx. 2 MB)', en: 'Photo (optional, max 2 MB)' },
  result: { es: 'Imagen del resultado (opcional, máx. 5 MB)', en: 'Result image (optional, max 5 MB)' },
  video: { es: 'Video (opcional, máx. 50 MB)', en: 'Video (optional, max 50 MB)' },
  submit: { es: 'Enviar para revisión', en: 'Submit for review' },
  sending: { es: 'Enviando…', en: 'Sending…' },
  eName: { es: 'El nombre es obligatorio.', en: 'Name is required.' },
  eMsg: { es: 'Escribe al menos 20 caracteres.', en: 'Write at least 20 characters.' },
  eFile: { es: 'Archivo demasiado grande o tipo no permitido.', en: 'File too large or type not allowed.' },
  eSend: { es: 'No se pudo enviar tu opinión. Inténtalo de nuevo.', en: "We couldn't send your review. Please try again." },
  eUpload: { es: 'Error al subir los archivos. Verifica el tamaño e inténtalo de nuevo.', en: 'Upload failed. Check the file size and try again.' },
  eLimit: { es: 'Recibimos muchas opiniones desde tu conexión. Inténtalo más tarde.', en: 'We received many reviews from your connection. Try again later.' },
  doneTitle: { es: 'Gracias.', en: 'Thank you.' },
  doneBody: { es: 'Recibimos tu opinión. Aparecerá en la web cuando sea aprobada.', en: 'We received your review. It will appear on the site once approved.' },
}

// Short plan descriptions for the home page (full inclusion lists live in PLANS).
export const PLAN_SHORT: Record<string, L> = {
  basica: { es: 'Sitio web a tu medida, diseño móvil, SEO básico e integración con WhatsApp.', en: 'A website tailored to you, mobile-first design, basic SEO and WhatsApp integration.' },
  profesional: { es: 'Sitio de mayor alcance, SEO avanzado, blog, bot básico de WhatsApp y analítica.', en: 'A larger website, advanced SEO, a blog, basic WhatsApp bot and analytics.' },
  automatizacion: { es: 'Bot personalizado, flujos automáticos, agendamiento, integraciones, panel y capacitación.', en: 'Custom WhatsApp bot, smart workflows, scheduling, integrations, dashboard and training.' },
  medida: { es: 'Plataformas administrativas, dashboards, sistemas, APIs, integraciones complejas y aplicaciones.', en: 'Administrative platforms, dashboards, tailored systems, APIs, complex integrations and apps.' },
}

// Contact without forms (launch 1.0): WhatsApp is the main channel.
export const CONTACT_WA = {
  title: { es: 'ESCRÍBENOS POR WHATSAPP', en: 'MESSAGE US ON WHATSAPP' },
  body: {
    es: 'Es nuestro canal principal para empezar un proyecto: cuéntanos tu idea y la conversamos.',
    en: 'It is our main channel to start a project: tell us your idea and we will talk it through.',
  },
  cta: { es: 'Abrir WhatsApp', en: 'Open WhatsApp' },
  briefIntro: { es: 'Escríbenos por WhatsApp y cuéntanos qué necesitas.', en: 'Message us on WhatsApp and tell us what you need.' },
}
