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
    "hero.title": "Your business deserves real digital presence.",
    "hero.subtitle": "Web Developer & Digital Strategist",
    "hero.description":
      "I design and build websites, platforms and automations that generate real results — not just look good. I work with businesses in La Guajira and across Colombia.",
    "hero.cta.primary": "I want a website →",
    "hero.cta.projects": "View Projects",

    "about.tag": "About me",
    "about.title": "Your business deserves a trusted digital partner.",
    "about.p1":
      "I'm Joshua Navarro, a freelance web developer based in Riohacha, La Guajira, Colombia. For 3+ years, I've been designing and building websites, platforms and automations for businesses across the region.",
    "about.p2":
      "I've worked with tattoo studios, foundations, event companies and organizations. My goal isn't just to make your business look good online — it's to make it generate real results.",
    "about.stat.projects": "Projects Built",
    "about.stat.clients": "Real Clients",
    "about.stat.years": "Years of Experience",
    "about.stat.tech": "Technologies",

    "projects.tag": "Selected Work",
    "projects.title": "Real projects for real businesses.",
    "projects.subtitle":
      "Client websites, custom platforms and digital tools that generate results.",
    "projects.problem": "Problem",
    "projects.solution": "Solution",
    "projects.impact": "Impact",
    "projects.features": "Key Features",
    "projects.tech": "Tech Stack",
    "projects.code": "View Code",
    "projects.demo": "Live Demo",
    "projects.more": "More Projects",
    "projects.featured": "Featured",
    "projects.realClient": "Real Client",
    "projects.highlighted": "Featured",

    "experience.tag": "Experience",
    "experience.title": "Real work. Real clients. Real results.",
    "experience.freelance": "Freelance",
    "experience.contract": "Contract",
    "experience.personal": "Personal",

    "skills.tag": "Technical Stack",
    "skills.title": "Tools I use to build your business.",

    "contact.tag": "Contact",
    "contact.title": "Ready to get started?",
    "contact.subtitle":
      "Tell me what your business needs. I'll respond in less than 24 hours.",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.name.placeholder": "Your name",
    "contact.form.email.placeholder": "your@email.com",
    "contact.form.message.placeholder": "Tell me what your business needs...",
    "contact.form.submit": "Send Message",
    "contact.form.sending": "Sending...",
    "contact.form.success": "Message sent. I'll get back to you shortly.",
    "contact.form.error": "Something went wrong. Please try again.",

    "footer.built": "Built with Next.js + Tailwind",
    "footer.rights": "All rights reserved.",
  },
  es: {
    "nav.about": "Sobre mí",
    "nav.projects": "Proyectos",
    "nav.experience": "Experiencia",
    "nav.skills": "Habilidades",
    "nav.contact": "Contacto",

    "hero.available": "Disponible para nuevos proyectos",
    "hero.title": "Tu negocio merece presencia digital real.",
    "hero.subtitle": "Desarrollador Web & Estrategia Digital",
    "hero.description":
      "Diseño y desarrollo sitios web, plataformas y automatizaciones que generan resultados concretos — no solo se ven bien. Trabajo con negocios en La Guajira y toda Colombia.",
    "hero.cta.primary": "Quiero un sitio web →",
    "hero.cta.projects": "Ver proyectos",

    "about.tag": "Sobre mí",
    "about.title": "Tu negocio merece un socio digital de confianza.",
    "about.p1":
      "Soy Joshua Navarro, desarrollador web freelance con sede en Riohacha, La Guajira. Llevo más de 3 años diseñando y construyendo sitios web, plataformas y automatizaciones para negocios en Colombia.",
    "about.p2":
      "He trabajado con estudios de tatuaje, fundaciones, empresas de eventos y organizaciones. Mi objetivo no es solo que tu negocio se vea bien en internet — es que genere resultados reales.",
    "about.stat.projects": "Proyectos",
    "about.stat.clients": "Clientes reales",
    "about.stat.years": "Años de experiencia",
    "about.stat.tech": "Tecnologías",

    "projects.tag": "Trabajo seleccionado",
    "projects.title": "Proyectos reales para negocios reales.",
    "projects.subtitle":
      "Sitios web para clientes, plataformas a medida y herramientas digitales que generan resultados.",
    "projects.problem": "Problema",
    "projects.solution": "Solución",
    "projects.impact": "Impacto",
    "projects.features": "Características clave",
    "projects.tech": "Stack tecnológico",
    "projects.code": "Ver código",
    "projects.demo": "Demo en vivo",
    "projects.more": "Más proyectos",
    "projects.featured": "Destacado",
    "projects.realClient": "Cliente real",
    "projects.highlighted": "Destacado",

    "experience.tag": "Experiencia",
    "experience.title": "Trabajo real. Clientes reales. Resultados reales.",
    "experience.freelance": "Freelance",
    "experience.contract": "Contrato",
    "experience.personal": "Personal",

    "skills.tag": "Stack técnico",
    "skills.title": "Herramientas que uso para hacer crecer tu negocio.",

    "contact.tag": "Contacto",
    "contact.title": "¿Listo para empezar?",
    "contact.subtitle":
      "Cuéntame qué necesita tu negocio. Respondo en menos de 24 horas.",
    "contact.form.name": "Nombre",
    "contact.form.email": "Correo",
    "contact.form.message": "Mensaje",
    "contact.form.name.placeholder": "Tu nombre",
    "contact.form.email.placeholder": "tu@correo.com",
    "contact.form.message.placeholder": "Cuéntame qué necesita tu negocio...",
    "contact.form.submit": "Enviar mensaje",
    "contact.form.sending": "Enviando...",
    "contact.form.success": "Mensaje enviado. Te respondo pronto.",
    "contact.form.error": "Algo salió mal. Inténtalo de nuevo.",

    "footer.built": "Construido con Next.js + Tailwind",
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
