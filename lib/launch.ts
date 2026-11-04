/**
 * DeepSun Studio 1.0 — launch switches. One place decides what the PUBLIC site shows.
 *
 * Everything that is switched off here is KEPT in the repository (code, data and copy) so it can be activated later:
 * nothing was deleted. The defaults are the safe launch values; staging/preview tests of the full system turn the first two on with
 * environment variables (NEXT_PUBLIC_* are read at build time).
 */
const on = (v: string | undefined) => v === 'true'

/** Forms that collect personal data (contact, project brief, testimonials) and the testimonials carousel.
 *  OFF until there is a privacy policy + authorization wording approved by the owner (Ley 1581/2012). WhatsApp is the contact channel. */
export const FORMS_ENABLED = on(process.env.NEXT_PUBLIC_FORMS_ENABLED)

/** Investor portal (/portal/*). OFF = every /portal URL answers 404 from the public deployment (see proxy.ts). */
export const PORTAL_ENABLED = on(process.env.NEXT_PUBLIC_PORTAL_ENABLED)

/** Public JSON endpoints /api/projects|stats|experience (not used by the site; they publish the technical stack and internal CV data). */
export const LEGACY_API_ENABLED = on(process.env.NEXT_PUBLIC_LEGACY_API_ENABLED)

/** Figures (10+ projects / 6+ clients / 3+ years): published before, no independent evidence. Flip to true only once verified. */
export const SHOW_UNVERIFIED_FIGURES = false

/** Case studies. false = hidden everywhere (home, /proyectos, detail page, sitemap) until the owner confirms the client's permission.
 *  The content stays in data/portfolio.ts, data/projects.ts and lib/site-content.ts (CASES). */
export const CASE_PUBLISHED: Record<string, boolean> = {
  'lufe-art-tattoo': false, // client work — publication permission pending
  'fundacion-vida-amor-salud': false, // client work — publication permission pending
  siepa: false, // client work (confidential institution) — publication permission pending
  'premios-la-cima': false, // client work — publication permission pending
  'scraper-app-gui': true, // in-house project
  'ms-usuarios': true, // in-house project
}
