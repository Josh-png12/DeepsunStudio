export type Lang = "en" | "es";
export type LocalizedString = Record<Lang, string>;
export type LocalizedArray = Record<Lang, string[]>;

export interface Project {
  title: string;
  slug: string;
  tagline: LocalizedString;
  description: LocalizedString;
  problem: LocalizedString;
  solution: LocalizedString;
  impact: LocalizedString;
  features: LocalizedArray;
  stack: string[];
  category: "automation" | "backend" | "systems" | "client" | "fullstack";
  featured: boolean;
  realClient?: boolean;
  highlighted?: boolean;
  github?: string;
  demo?: string;
  year: number;
}

export interface ExperienceItem {
  company: LocalizedString;
  role: LocalizedString;
  period: string;
  description: LocalizedString;
  highlights: string[];
  type: "freelance" | "contract" | "personal";
}

export interface SkillCategory {
  label: LocalizedString;
  skills: string[];
  accent: string;
}

export interface Stats {
  projectsBuilt: number;
  realClients: number;
  yearsExperience: number;
  technologies: number;
}

export const projects: Project[] = [
  // 1. LUFE Art Tattoo — Cliente real
  {
    title: "LUFE Art Tattoo",
    slug: "lufe-art-tattoo",
    tagline: {
      en: "Commercial studio website — animated gallery, artist profiles, booking integration",
      es: "Sitio web comercial para estudio — galería animada, perfiles de artistas, integración de reservas",
    },
    description: {
      en: "A high-converting commercial website for a professional tattoo studio. Focused on brand storytelling, portfolio showcase, and turning visitors into booked appointments.",
      es: "Un sitio web comercial de alta conversión para un estudio de tatuajes profesional. Enfocado en narrativa de marca, showcase de portafolio y convertir visitantes en citas reservadas.",
    },
    problem: {
      en: "The studio had no online presence — losing clients to competitors with digital visibility. The quality of their work wasn't reaching its target audience.",
      es: "El estudio no tenía presencia online — perdiendo clientes ante competidores con visibilidad digital. La calidad de su trabajo no llegaba a su audiencia objetivo.",
    },
    solution: {
      en: "Designed a mobile-first, visually striking website with animated gallery, artist profiles, service catalog, and booking CTAs. Optimized for local SEO to capture organic discovery.",
      es: "Diseñé un sitio web mobile-first, visualmente impactante con galería animada, perfiles de artistas, catálogo de servicios y CTAs de reserva. Optimizado para SEO local para capturar descubrimiento orgánico.",
    },
    impact: {
      en: "Established professional digital brand presence, enabled online client acquisition, and provided a scalable platform for portfolio growth.",
      es: "Estableció presencia de marca digital profesional, habilitó la adquisición de clientes online y proporcionó una plataforma escalable para el crecimiento del portafolio.",
    },
    features: {
      en: [
        "Animated portfolio gallery with lightbox viewer",
        "Individual artist profiles with specialty tags",
        "Service catalog with pricing tiers",
        "Mobile-first responsive layout",
        "Local SEO optimization with structured data",
      ],
      es: [
        "Galería de portafolio animada con visor lightbox",
        "Perfiles individuales de artistas con etiquetas de especialidad",
        "Catálogo de servicios con niveles de precio",
        "Layout responsive mobile-first",
        "Optimización SEO local con datos estructurados",
      ],
    },
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    category: "client",
    featured: true,
    realClient: true,
    github: "https://github.com/Josh-png12/LUFE-ART-TATTOO",
    year: 2024,
  },

  // 2. Fundación Vida Amor y Salud — Cliente real
  {
    title: "Fundación Vida Amor y Salud",
    slug: "fundacion-vida-amor-salud",
    tagline: {
      en: "Digital platform for a Colombian health and social welfare foundation",
      es: "Plataforma digital para fundación colombiana de salud y bienestar social",
    },
    description: {
      en: "Complete digital presence for a nonprofit organization focused on health, community support, and social welfare programs — including donation flows, volunteer management, and program showcases.",
      es: "Presencia digital completa para una organización sin fines de lucro enfocada en salud, apoyo comunitario y programas de bienestar social — incluyendo flujos de donación, gestión de voluntarios y showcase de programas.",
    },
    problem: {
      en: "The foundation had zero digital presence, limiting outreach and making it impossible to receive online donations or recruit volunteers at scale.",
      es: "La fundación tenía cero presencia digital, limitando su alcance e imposibilitando recibir donaciones online o reclutar voluntarios a escala.",
    },
    solution: {
      en: "Built a trust-focused website highlighting mission, programs, team, and impact metrics. Integrated donation and volunteer signup flows with accessible, standards-compliant design.",
      es: "Construí un sitio web centrado en la confianza que destaca la misión, programas, equipo y métricas de impacto. Integré flujos de donación y registro de voluntarios con diseño accesible y compatible con estándares.",
    },
    impact: {
      en: "Established institutional credibility online and opened digital channels for donations and volunteer recruitment, directly expanding the foundation's operational capacity.",
      es: "Estableció credibilidad institucional online y abrió canales digitales para donaciones y reclutamiento de voluntarios, expandiendo directamente la capacidad operativa de la fundación.",
    },
    features: {
      en: [
        "Mission and program presentation",
        "Impact metrics and statistics",
        "Donation and volunteer signup flows",
        "WCAG-accessible design",
        "SEO-optimized for nonprofit discovery",
      ],
      es: [
        "Presentación de misión y programas",
        "Métricas e indicadores de impacto",
        "Flujos de donación y registro de voluntarios",
        "Diseño accesible WCAG",
        "SEO optimizado para descubrimiento de ONGs",
      ],
    },
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "client",
    featured: true,
    realClient: true,
    year: 2023,
  },

  // 3. Premios La Cima — Cliente real
  {
    title: "Premios La Cima",
    slug: "premios-la-cima",
    tagline: {
      en: "Premium event platform for a prestigious institutional awards ceremony",
      es: "Plataforma de evento premium para una ceremonia de premios institucional de prestigio",
    },
    description: {
      en: "Official web platform for a prestigious awards event — featuring dynamic nominee profiles, category showcases, countdown timers, sponsor sections, and event logistics management.",
      es: "Plataforma web oficial para un evento de premios de prestigio — con perfiles dinámicos de nominados, showcase de categorías, contadores regresivos, secciones de patrocinadores y gestión logística del evento.",
    },
    problem: {
      en: "The event lacked a digital home that matched its prestige. Organizers needed a system to manage nominees, categories, and event information without developer dependency.",
      es: "El evento carecía de un hogar digital a la altura de su prestigio. Los organizadores necesitaban un sistema para gestionar nominados, categorías e información del evento sin depender de un desarrollador.",
    },
    solution: {
      en: "Designed a premium event website with a content-managed nominee system, category pages, and live countdown. Built with a clear information architecture for both attendees and organizers.",
      es: "Diseñé un sitio web de evento premium con sistema de nominados gestionado por contenido, páginas de categorías y cuenta regresiva en vivo. Construido con arquitectura de información clara para asistentes y organizadores.",
    },
    impact: {
      en: "Delivered a professional digital experience that elevated the event's brand and provided organizers with a scalable, reusable platform for future editions.",
      es: "Entregué una experiencia digital profesional que elevó la marca del evento y proporcionó a los organizadores una plataforma escalable y reutilizable para ediciones futuras.",
    },
    features: {
      en: [
        "Dynamic nominee profiles per category",
        "Live countdown to event date",
        "Sponsor and partner showcase",
        "Mobile-optimized attendee experience",
        "Content management for organizers",
      ],
      es: [
        "Perfiles dinámicos de nominados por categoría",
        "Cuenta regresiva en vivo a la fecha del evento",
        "Showcase de patrocinadores y aliados",
        "Experiencia para asistentes optimizada para móvil",
        "Gestión de contenido para organizadores",
      ],
    },
    stack: ["React", "Node.js", "CSS Modules", "MongoDB"],
    category: "client",
    featured: true,
    realClient: true,
    year: 2024,
  },

  // 4. SIEPA — Cliente real + Destacado
  {
    title: "SIEPA",
    slug: "siepa",
    tagline: {
      en: "Full-stack administrative platform built for real institutional operations",
      es: "Plataforma administrativa full-stack construida para operaciones institucionales reales",
    },
    description: {
      en: "SIEPA is a complete administrative system designed to manage institutional processes end-to-end — student records, reporting, analytics, and multi-role dashboards. Built for a real institution replacing manual spreadsheet workflows.",
      es: "SIEPA es un sistema administrativo completo diseñado para gestionar procesos institucionales de extremo a extremo — registros de estudiantes, reportes, analíticas y dashboards multi-rol. Construido para una institución real reemplazando flujos manuales con hojas de cálculo.",
    },
    problem: {
      en: "The institution relied on fragmented spreadsheets, manual data entry, and physical records — leading to data loss, reporting delays, and no real-time visibility into operations.",
      es: "La institución dependía de hojas de cálculo fragmentadas, ingreso manual de datos y registros físicos — generando pérdida de datos, demoras en reportes y nula visibilidad en tiempo real de las operaciones.",
    },
    solution: {
      en: "Built a centralized web platform with role-based access for administrators, teachers, and students. Automated reporting, real-time dashboards, and bulk data tools replaced the entire manual workflow.",
      es: "Construí una plataforma web centralizada con acceso por roles para administradores, docentes y estudiantes. Los reportes automatizados, dashboards en tiempo real y herramientas de datos masivos reemplazaron todo el flujo manual.",
    },
    impact: {
      en: "Report generation time cut from days to seconds. Eliminated data inconsistencies entirely. The institution now operates with real-time visibility into all processes.",
      es: "Tiempo de generación de reportes reducido de días a segundos. Inconsistencias de datos eliminadas por completo. La institución ahora opera con visibilidad en tiempo real de todos los procesos.",
    },
    features: {
      en: [
        "Multi-role dashboard: Admin / Teacher / Student",
        "Student record management and academic tracking",
        "Automated report generation with PDF export",
        "Real-time analytics and data visualization",
        "Bulk CSV import/export for data migration",
        "Audit log and access control per role",
      ],
      es: [
        "Dashboard multi-rol: Admin / Docente / Estudiante",
        "Gestión de registros de estudiantes y seguimiento académico",
        "Generación automática de reportes con exportación PDF",
        "Analíticas en tiempo real y visualización de datos",
        "Importación/exportación masiva CSV para migración de datos",
        "Log de auditoría y control de acceso por rol",
      ],
    },
    stack: ["React", "Node.js", "Express", "MySQL", "Chart.js", "JWT"],
    category: "systems",
    featured: true,
    realClient: true,
    highlighted: true,
    github: "https://github.com/Josh-png12/Siepa",
    year: 2023,
  },

  // 5. Scraper App GUI
  {
    title: "Scraper App GUI",
    slug: "scraper-app-gui",
    tagline: {
      en: "Automation tool that turns manual data collection into a single click",
      es: "Herramienta de automatización que convierte la recolección manual en un clic",
    },
    description: {
      en: "A cross-platform desktop application for automated web scraping with a graphical interface — no code required. Built to empower non-technical users to extract structured data from any website.",
      es: "Aplicación de escritorio multiplataforma para web scraping automatizado con interfaz gráfica — sin código requerido. Construida para que usuarios no técnicos extraigan datos estructurados de cualquier sitio web.",
    },
    problem: {
      en: "Manual data extraction from websites is time-consuming, error-prone, and requires technical knowledge. Teams waste hours on repetitive copy-paste tasks with no reliable way to automate them.",
      es: "La extracción manual de datos de sitios web es lenta, propensa a errores y requiere conocimiento técnico. Los equipos pierden horas en tareas repetitivas sin forma confiable de automatizarlas.",
    },
    solution: {
      en: "Built a graphical layer over the data-collection tooling that abstracts all the complexity. Users configure targets visually, schedule runs, and export to CSV/JSON/Excel with zero code.",
      es: "Construí una capa gráfica sobre las herramientas de recolección de datos que abstrae toda la complejidad. Los usuarios configuran objetivos visualmente, programan ejecuciones y exportan sin código.",
    },
    impact: {
      en: "Reduces data collection time by 90%+ compared to manual extraction. Enables teams without engineering knowledge to build automated data pipelines in minutes.",
      es: "Reduce el tiempo de recolección de datos más del 90% frente a la extracción manual. Permite a equipos sin conocimiento técnico construir pipelines de datos automatizados en minutos.",
    },
    features: {
      en: [
        "Visual point-and-click configuration — zero code needed",
        "Multi-format export: CSV, JSON, Excel",
        "Scheduled & recurring automated runs",
        "Anti-detection and rate-limiting mechanisms",
        "Real-time progress tracking and structured error handling",
      ],
      es: [
        "Configuración visual point-and-click — sin código requerido",
        "Exportación en múltiples formatos: CSV, JSON, Excel",
        "Ejecuciones programadas y recurrentes automatizadas",
        "Mecanismos anti-detección y limitación de velocidad",
        "Seguimiento en tiempo real y manejo estructurado de errores",
      ],
    },
    stack: ["Python", "Tkinter", "BeautifulSoup4", "Selenium", "Pandas", "Requests"],
    category: "automation",
    featured: false,
    github: "https://github.com/Josh-png12/scraper-app-gui",
    year: 2024,
  },

  // 6. ms-usuarios
  {
    title: "ms-usuarios",
    slug: "ms-usuarios",
    tagline: {
      en: "Production-grade user management microservice — JWT auth, RBAC, full lifecycle API",
      es: "Microservicio de gestión de usuarios de nivel producción — auth JWT, RBAC, API de ciclo de vida completo",
    },
    description: {
      en: "A standalone user management microservice built for scalable backend architectures. Handles authentication, authorization, user lifecycle, and role management through a clean, well-documented REST API.",
      es: "Un microservicio independiente de gestión de usuarios construido para arquitecturas backend escalables. Maneja autenticación, autorización, ciclo de vida de usuarios y gestión de roles mediante una API REST limpia y documentada.",
    },
    problem: {
      en: "Every application needs user management. Building it from scratch for each project is slow, repetitive, and security-critical — a bad implementation can expose the whole system.",
      es: "Toda aplicación necesita gestión de usuarios. Construirlo desde cero para cada proyecto es lento, repetitivo y crítico en seguridad — una mala implementación puede exponer todo el sistema.",
    },
    solution: {
      en: "Designed a domain-isolated microservice following REST principles with clear separation of concerns. Implements stateless token authentication, hardened password hashing, and fine-grained role-based access control.",
      es: "Diseñé un microservicio con dominio aislado siguiendo principios REST con clara separación de responsabilidades. Implementa autenticación por tokens sin estado, almacenamiento seguro de contraseñas y control de acceso granular por roles.",
    },
    impact: {
      en: "A plug-and-play user system integrable into any backend architecture in under an hour, with enterprise-grade security baked in from day one.",
      es: "Un sistema de usuarios plug-and-play integrable en cualquier arquitectura backend en menos de una hora, con seguridad de nivel empresarial incorporada desde el inicio.",
    },
    features: {
      en: [
        "Stateless token authentication with access + refresh tokens",
        "Role-Based Access Control (RBAC) with middleware guards",
        "Hardened password hashing with configurable cost",
        "Full user CRUD with pagination and filtering",
        "Input validation, sanitization, and structured error responses",
        "RESTful API with consistent response envelope",
      ],
      es: [
        "Autenticación por tokens sin estado, con tokens de acceso y de refresco",
        "Control de Acceso Basado en Roles (RBAC) con guards de middleware",
        "Almacenamiento seguro de contraseñas con costo configurable",
        "CRUD completo de usuarios con paginación y filtrado",
        "Validación de entradas, sanitización y respuestas de error estructuradas",
        "API RESTful con envolvente de respuesta consistente",
      ],
    },
    stack: ["Node.js", "Express", "PostgreSQL", "JWT", "bcrypt", "TypeScript"],
    category: "backend",
    featured: false,
    github: "https://github.com/Josh-png12/ms-usuarios",
    year: 2024,
  },
];

export const experience: ExperienceItem[] = [
  {
    company: { en: "LUFE Art Tattoo Studio", es: "Estudio LUFE Art Tattoo" },
    role: { en: "Web Development — DeepSun Studio", es: "Desarrollo Web — DeepSun Studio" },
    period: "2024",
    description: {
      en: "Built a complete commercial website from zero: animated gallery, artist profiles, booking flow, and local SEO. The studio had no digital presence; we built one that converts.",
      es: "Construimos un sitio web comercial completo desde cero: galería animada, perfiles de artistas, flujo de reservas y SEO local. El estudio no tenía presencia digital; construimos una que convierte.",
    },
    highlights: ["Mobile-first design", "Local SEO", "Booking integration"],
    type: "freelance",
  },
  {
    company: { en: "Premios La Cima", es: "Premios La Cima" },
    role: { en: "Platform Development — DeepSun Studio", es: "Desarrollo de Plataforma — DeepSun Studio" },
    period: "2024",
    description: {
      en: "Built the official platform for a prestigious awards ceremony — nominee management, countdown system, and UI that matched the event's brand. Organizers needed zero developer dependency for content updates.",
      es: "Construimos la plataforma oficial para una ceremonia de premios de prestigio — gestión de nominados, sistema de cuenta regresiva y UI acorde a la marca. Los organizadores no necesitan un desarrollador para actualizar contenido.",
    },
    highlights: ["Event platform", "Dynamic content", "Premium UI/UX"],
    type: "contract",
  },
  {
    company: { en: "Fundación Vida Amor y Salud", es: "Fundación Vida Amor y Salud" },
    role: { en: "Full Stack Development — DeepSun Studio", es: "Desarrollo Full Stack — DeepSun Studio" },
    period: "2023",
    description: {
      en: "Built the foundation's complete digital infrastructure — website, program pages, donation flows, and volunteer signup — from zero to production. They had no digital presence; we built the whole thing.",
      es: "Construimos la infraestructura digital completa de la fundación — sitio web, páginas de programas, flujos de donación y registro de voluntarios — de cero a producción. No tenían presencia digital; construimos todo.",
    },
    highlights: ["Nonprofit platform", "Donation system", "Accessible design"],
    type: "freelance",
  },
  {
    company: { en: "Personal Engineering Projects", es: "Proyectos de Ingeniería Personales" },
    role: { en: "Systems Engineering", es: "Ingeniería de Sistemas" },
    period: "2023 – Presente",
    description: {
      en: "Designed and built production-grade systems for internal use and technical validation: automation tools with GUI, backend microservices, and a full administrative platform (SIEPA) that replaced an institution's entire manual workflow.",
      es: "Diseñé y construí sistemas de nivel producción para uso propio y validación técnica: herramientas de automatización con GUI, microservicios backend y una plataforma administrativa completa (SIEPA) que reemplazó el flujo manual completo de una institución.",
    },
    highlights: ["System architecture", "Backend APIs", "Automation tools"],
    type: "personal",
  },
];

export const skillCategories: SkillCategory[] = [
  {
    label: { en: "Frontend", es: "Frontend" },
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML5", "CSS3"],
    accent: "blue",
  },
  {
    label: { en: "Backend", es: "Backend" },
    skills: ["Node.js", "Express", "Python", "REST APIs", "JWT", "bcrypt", "Middleware"],
    accent: "violet",
  },
  {
    label: { en: "Databases", es: "Bases de Datos" },
    skills: ["PostgreSQL", "MySQL", "MongoDB", "SQL", "ORM"],
    accent: "cyan",
  },
  {
    label: { en: "Automation", es: "Automatización" },
    skills: ["Python", "Selenium", "BeautifulSoup4", "Pandas", "Scripting", "Tkinter"],
    accent: "emerald",
  },
  {
    label: { en: "APIs & Integration", es: "APIs e Integración" },
    skills: ["REST", "HTTP/HTTPS", "OAuth", "Webhooks", "Postman", "JSON"],
    accent: "amber",
  },
  {
    label: { en: "DevOps & Tools", es: "DevOps y Herramientas" },
    skills: ["Git", "GitHub", "Vercel", "Docker", "Linux", "VS Code"],
    accent: "rose",
  },
];

export const stats: Stats = {
  projectsBuilt: 10,
  realClients: 6,
  yearsExperience: 3,
  technologies: 20,
};

export const personalInfo = {
  name: "Joshua Navarro",
  title: "Fundador, DeepSun Studio",
  subtitle: "Desarrollo web · Sistemas · Automatizaciones",
  availability: "Disponible para nuevos proyectos",
  location: "Riohacha, La Guajira, Colombia",
  experience: "3+ años",
  social: {
    email: "joshua@deepsunstudio.com",
    github: "https://github.com/Josh-png12",
    linkedin: "https://www.linkedin.com/in/joshua-navarro-rad-06ab18258",
    whatsapp: "+57 319 714 9647",
    whatsappUrl: "https://wa.me/573197149647",
  },
};

export const aboutParagraphs: string[] = [
  "Soy Joshua Navarro, desarrollador web freelance con sede en Riohacha, La Guajira. Llevo más de 3 años diseñando y construyendo sitios web, plataformas y automatizaciones para negocios en Colombia.",
  "He trabajado con estudios de tatuaje, fundaciones, organizaciones y empresas de toda la región. Mi objetivo no es solo que tu negocio se vea bien en internet — es que genere resultados reales.",
  "Trabajo directamente contigo, sin intermediarios, y me aseguro de que entiendas cada paso del proceso.",
];

export const skills = {
  core: ["React", "Next.js", "TypeScript", "Node.js", "Python", "REST APIs"],
  specialties: ["Sitios Web", "Automatización", "Sistemas a Medida", "SEO Local", "PostgreSQL", "MySQL"],
  competent: ["Docker", "MongoDB", "WhatsApp API", "Framer Motion", "Express", "Vercel"],
  tools: ["Git", "GitHub", "Vercel", "VS Code", "Postman", "Linux"],
};
