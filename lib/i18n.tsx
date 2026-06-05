"use client";

import React, { createContext, useContext, useState } from "react";
import type { Lang } from "@/data/portfolio";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.skills": "Skills",
    "nav.contact": "Contact",

    "hero.available": "Available for new projects",
    "hero.title": "Software that makes businesses work better.",
    "hero.subtitle": "Web Development · Systems · Automation",
    "hero.description":
      "We build websites, platforms, and automations for businesses in Colombia and Latin America. Concrete deliverables — not proposals that gather dust.",
    "hero.cta.primary": "Start a project",
    "hero.cta.projects": "See the work",

    "about.tag": "The studio",
    "about.title": "Concrete work. No runaround.",
    "about.p1":
      "DeepSun Studio is a software development studio based in Riohacha, La Guajira. We design and build websites, platforms, and automations — with 3+ years of real projects and real clients behind the work.",
    "about.p2":
      "We've replaced spreadsheets with systems, built platforms from zero to production, and helped local businesses appear where their clients look. Every project ships with working code and documented delivery.",
    "about.p3": "Based in Riohacha, La Guajira — we work with local and national businesses that need professional digital presence: hotels, clinics, restaurants, nonprofits, and companies across Colombia.",
    "about.stat.projects": "Projects shipped",
    "about.stat.clients": "Clients",
    "about.stat.years": "Years building",
    "about.stat.tech": "Technologies",

    "projects.tag": "Selected work",
    "projects.title": "Projects shipped, not pitched.",
    "projects.subtitle":
      "Client sites, custom platforms, and tools built for real operations — with the code to prove it.",
    "projects.problem": "Problem",
    "projects.solution": "Solution",
    "projects.impact": "Outcome",
    "projects.features": "What we built",
    "projects.tech": "Stack",
    "projects.code": "Code",
    "projects.demo": "Live site",
    "projects.more": "More work",
    "projects.featured": "Featured",
    "projects.realClient": "Client project",
    "projects.highlighted": "Featured",

    "experience.tag": "How we work",
    "experience.title": "Shipped projects. Served clients.",
    "experience.freelance": "Client",
    "experience.contract": "Contract",
    "experience.personal": "Own work",

    "skills.tag": "Technical stack",
    "skills.title": "The stack behind every project.",

    "contact.tag": "Start a project",
    "contact.title": "Tell us what you're building.",
    "contact.subtitle":
      "Describe what you need. We respond in under 24 hours with a concrete next step — not a generic proposal.",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.name.placeholder": "Your name",
    "contact.form.email.placeholder": "your@email.com",
    "contact.form.message.placeholder": "What are you building? What's the problem you need solved?",
    "contact.form.submit": "Send",
    "contact.form.sending": "Sending...",
    "contact.form.success": "Received. We'll be in touch within 24 hours.",
    "contact.form.error": "Couldn't send. Try WhatsApp instead.",

    "footer.built": "DeepSun Studio",
    "footer.rights": "All rights reserved.",
  },
  es: {
    "nav.about": "Sobre mí",
    "nav.projects": "Proyectos",
    "nav.experience": "Experiencia",
    "nav.skills": "Habilidades",
    "nav.contact": "Contacto",

    "hero.available": "Disponible para nuevos proyectos",
    "hero.title": "Software que hace funcionar negocios.",
    "hero.subtitle": "Desarrollo web · Sistemas · Automatizaciones",
    "hero.description":
      "Construimos sitios web, plataformas y automatizaciones para negocios en Colombia y Latinoamérica. Entregables concretos — no propuestas que quedan en el cajón.",
    "hero.cta.primary": "Iniciar proyecto",
    "hero.cta.projects": "Ver el trabajo",

    "about.tag": "El estudio",
    "about.title": "Trabajo concreto, entregado.",
    "about.p1":
      "DeepSun Studio es un estudio de desarrollo de software con sede en Riohacha, La Guajira. Diseñamos y construimos sitios web, plataformas y automatizaciones — con más de 3 años de proyectos reales y clientes reales.",
    "about.p2":
      "Hemos reemplazado hojas de cálculo con sistemas, construido plataformas de cero a producción y ayudado a negocios locales a aparecer donde sus clientes buscan. Cada proyecto se entrega con código funcionando y documentación.",
    "about.p3": "Con sede en Riohacha, La Guajira — trabajamos con negocios locales y nacionales que necesitan presencia digital profesional: hoteles, clínicas, restaurantes, fundaciones y empresas en toda Colombia.",
    "about.stat.projects": "Proyectos entregados",
    "about.stat.clients": "Clientes",
    "about.stat.years": "Años construyendo",
    "about.stat.tech": "Tecnologías",

    "projects.tag": "Trabajo seleccionado",
    "projects.title": "Proyectos entregados, no propuestos.",
    "projects.subtitle":
      "Sitios para clientes, plataformas a medida y herramientas construidas para operaciones reales — con el código que lo respalda.",
    "projects.problem": "Problema",
    "projects.solution": "Solución",
    "projects.impact": "Resultado",
    "projects.features": "Lo que construimos",
    "projects.tech": "Stack",
    "projects.code": "Código",
    "projects.demo": "Sitio en vivo",
    "projects.more": "Más trabajo",
    "projects.featured": "Destacado",
    "projects.realClient": "Proyecto de cliente",
    "projects.highlighted": "Destacado",

    "experience.tag": "Cómo trabajamos",
    "experience.title": "Proyectos entregados. Clientes atendidos.",
    "experience.freelance": "Cliente",
    "experience.contract": "Contrato",
    "experience.personal": "Propio",

    "skills.tag": "Stack técnico",
    "skills.title": "El stack detrás de cada proyecto.",

    "contact.tag": "Iniciar proyecto",
    "contact.title": "Cuéntanos qué construyes.",
    "contact.subtitle":
      "Describe qué necesitas. Respondemos en menos de 24 horas con un paso concreto — no una propuesta genérica.",
    "contact.form.name": "Nombre",
    "contact.form.email": "Correo",
    "contact.form.message": "Mensaje",
    "contact.form.name.placeholder": "Tu nombre",
    "contact.form.email.placeholder": "tu@correo.com",
    "contact.form.message.placeholder": "¿Qué estás construyendo? ¿Cuál es el problema que necesitas resolver?",
    "contact.form.submit": "Enviar",
    "contact.form.sending": "Enviando...",
    "contact.form.success": "Recibido. Te escribimos en menos de 24 horas.",
    "contact.form.error": "No se pudo enviar. Escríbenos por WhatsApp.",

    "footer.built": "DeepSun Studio",
    "footer.rights": "Todos los derechos reservados.",
  },
};

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  const t = (key: string) => translations[lang][key] ?? key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  return useContext(I18nContext);
}
