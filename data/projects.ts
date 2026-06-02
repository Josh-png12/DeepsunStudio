export interface ProjectDetail {
  slug: string
  title: string
  tagline: string
  category: 'client' | 'systems' | 'automation' | 'backend' | 'fullstack'
  year: number
  client?: string
  clientDesc: string
  problem: string
  solution: string
  impact: string
  stack: string[]
  github?: string
  demo?: string
  featured: boolean
  realClient: boolean
  highlighted?: boolean
}

export const projectDetails: ProjectDetail[] = [
  {
    slug: 'lufe-art-tattoo',
    title: 'LUFE Art Tattoo',
    tagline: 'Sitio web comercial para estudio de tatuajes — galería animada, perfiles de artistas, integración de reservas',
    category: 'client',
    year: 2024,
    client: 'LUFE Art Tattoo Studio',
    clientDesc:
      'Estudio de tatuajes profesional en Colombia con artistas especializados en estilos realistas, blackwork y neo-tradicional. Antes del proyecto, toda su presencia digital era Instagram.',
    problem:
      'El estudio perdía clientes frente a competidores que sí tenían sitio web. Su trabajo de alta calidad no llegaba a personas que buscaban estudios en Google. Sin presencia digital, cada cliente llegaba solo por boca a boca.',
    solution:
      'Diseñé y desarrollé un sitio web mobile-first con galería animada con lightbox, perfiles individuales de artistas con sus estilos y portfolios, catálogo de servicios con precios, y CTAs de reserva directa por WhatsApp. SEO local optimizado para aparecer cuando alguien busca "estudio de tatuajes" en la ciudad.',
    impact:
      'El estudio estableció presencia digital profesional desde el primer día de lanzamiento. Los artistas ahora comparten su perfil individual en sus redes sociales. El flujo de consultas por WhatsApp aumentó visiblemente en los primeros 30 días.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    github: 'https://github.com/Josh-png12/LUFE-ART-TATTOO',
    featured: true,
    realClient: true,
  },
  {
    slug: 'fundacion-vida-amor-salud',
    title: 'Fundación Vida Amor y Salud',
    tagline: 'Plataforma digital completa para fundación colombiana de salud y bienestar social',
    category: 'client',
    year: 2023,
    client: 'Fundación Vida Amor y Salud',
    clientDesc:
      'Organización sin fines de lucro colombiana enfocada en salud comunitaria, apoyo social y programas de bienestar para poblaciones vulnerables en La Guajira.',
    problem:
      'La fundación operaba sin presencia digital, lo que limitaba su alcance e imposibilitaba recibir donaciones online o reclutar voluntarios más allá de su red inmediata. No podían demostrar su impacto a potenciales donantes institucionales.',
    solution:
      'Construí una plataforma digital completa centrada en generar confianza institucional: página de misión, showcase de programas con métricas de impacto, perfiles del equipo, flujos de donación y registro de voluntarios. Diseño accesible WCAG y optimizado para SEO de ONGs.',
    impact:
      'La fundación estableció credibilidad institucional online, abrió canales digitales para donaciones y amplió su alcance para reclutamiento de voluntarios más allá de su comunidad local.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    featured: true,
    realClient: true,
  },
  {
    slug: 'premios-la-cima',
    title: 'Premios La Cima',
    tagline: 'Plataforma web de evento premium para ceremonia de premios institucional de prestigio',
    category: 'client',
    year: 2024,
    client: 'Premios La Cima',
    clientDesc:
      'Ceremonia de reconocimiento institucional anual que distingue a líderes, empresas y proyectos destacados en la región. Evento de alto perfil con cobertura mediática local.',
    problem:
      'El evento carecía de un espacio digital a la altura de su prestigio. Los organizadores necesitaban gestionar nominados y categorías sin depender de un desarrollador para cada actualización.',
    solution:
      'Diseñé una plataforma web premium con perfiles dinámicos de nominados por categoría, sistema de cuenta regresiva al evento, galería de patrocinadores y aliados, y una arquitectura de contenido que los organizadores podían actualizar fácilmente.',
    impact:
      'El evento tuvo una presencia digital profesional que elevó su percepción de marca. La plataforma es reutilizable para ediciones futuras con mínimas modificaciones.',
    stack: ['React', 'Node.js', 'CSS Modules', 'MongoDB'],
    featured: true,
    realClient: true,
  },
  {
    slug: 'siepa',
    title: 'SIEPA',
    tagline: 'Plataforma administrativa full-stack para gestión institucional — multi-rol, reportes automáticos, analíticas en tiempo real',
    category: 'systems',
    year: 2023,
    client: 'Institución educativa (confidencial)',
    clientDesc:
      'Institución educativa colombiana que gestionaba todos sus procesos administrativos con hojas de cálculo fragmentadas, reportes manuales y sin visibilidad en tiempo real.',
    problem:
      'La institución dependía completamente de hojas de cálculo manuales: registros de estudiantes en Excel, reportes generados a mano que tomaban días, sin forma de ver el estado real de las operaciones. Los errores de datos eran frecuentes y la generación de reportes para directivos era un proceso agotador.',
    solution:
      'Construí un sistema administrativo centralizado con roles diferenciados (Admin / Docente / Estudiante). Automaticé la generación de reportes con exportación PDF, implementé dashboards con analíticas en tiempo real, y herramientas de importación/exportación masiva CSV. Control de acceso granular y log de auditoría completo.',
    impact:
      'Generación de reportes reducida de días a segundos. Cero inconsistencias de datos. La institución opera con visibilidad completa en tiempo real de todos sus procesos académicos y administrativos.',
    stack: ['React', 'Node.js', 'Express', 'MySQL', 'Chart.js', 'JWT'],
    github: 'https://github.com/Josh-png12/Siepa',
    featured: true,
    realClient: true,
    highlighted: true,
  },
  {
    slug: 'scraper-app-gui',
    title: 'Scraper App GUI',
    tagline: 'Herramienta de escritorio para web scraping automatizado — sin código, exportación multi-formato',
    category: 'automation',
    year: 2024,
    clientDesc:
      'Proyecto personal de ingeniería para resolver el problema de la extracción manual de datos de sitios web, una tarea repetitiva que consumen horas en equipos sin conocimiento técnico.',
    problem:
      'La extracción manual de datos de sitios web consume horas, genera errores y requiere conocimiento técnico. Equipos sin ingenieros pierden tiempo valioso en tareas copy-paste sin forma confiable de automatizarlas.',
    solution:
      'Construí una capa GUI sobre el stack de scraping de Python (BeautifulSoup + Selenium) que abstrae toda la complejidad técnica. Los usuarios configuran objetivos visualmente, programan ejecuciones recurrentes y exportan resultados a CSV, JSON o Excel sin escribir una sola línea de código.',
    impact:
      'Reduce el tiempo de recolección de datos en más del 90% respecto a la extracción manual. Equipos sin conocimiento técnico pueden construir pipelines de datos automatizados en minutos.',
    stack: ['Python', 'Tkinter', 'BeautifulSoup4', 'Selenium', 'Pandas', 'Requests'],
    github: 'https://github.com/Josh-png12/scraper-app-gui',
    featured: false,
    realClient: false,
  },
  {
    slug: 'ms-usuarios',
    title: 'ms-usuarios',
    tagline: 'Microservicio de gestión de usuarios de nivel producción — JWT stateless, RBAC, API REST completa',
    category: 'backend',
    year: 2024,
    clientDesc:
      'Proyecto de ingeniería personal: un microservicio reutilizable de gestión de usuarios que resuelve el problema de tener que reconstruir auth y user management para cada proyecto nuevo.',
    problem:
      'Cada aplicación necesita gestión de usuarios. Construirlo desde cero para cada proyecto es lento, repetitivo y crítico en seguridad. Una implementación deficiente puede comprometer todo el sistema.',
    solution:
      'Diseñé un microservicio con dominio aislado siguiendo principios REST: autenticación JWT stateless con tokens de acceso y refresco, hash bcrypt con rondas configurables, control de acceso por roles (RBAC) con guards de middleware, y CRUD completo de usuarios con paginación y filtrado.',
    impact:
      'Sistema plug-and-play integrable en cualquier arquitectura backend en menos de una hora. Seguridad de nivel empresarial incorporada desde el primer día, sin reinventar la rueda en cada proyecto.',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'bcrypt', 'TypeScript'],
    github: 'https://github.com/Josh-png12/ms-usuarios',
    featured: false,
    realClient: false,
  },
]

export function getProjectBySlug(slug: string): ProjectDetail | undefined {
  return projectDetails.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return projectDetails.map((p) => p.slug)
}
