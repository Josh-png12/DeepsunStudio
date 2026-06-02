import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { projectDetails, getProjectBySlug, getAllSlugs } from '@/data/projects'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: `${project.title} — Caso de estudio DeepSun Studio`,
    description: project.tagline,
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  client: 'Cliente real',
  systems: 'Sistema',
  automation: 'Automatización',
  backend: 'Backend',
  fullstack: 'Full Stack',
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const allSlugs = getAllSlugs()
  const currentIndex = allSlugs.indexOf(slug)
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null
  const prevProject = prevSlug ? getProjectBySlug(prevSlug) : null
  const nextProject = nextSlug ? getProjectBySlug(nextSlug) : null

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-blue-600/[0.06] rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
                <Link href="/proyectos" className="hover:text-slate-300 transition-colors">Proyectos</Link>
                <span aria-hidden="true">/</span>
                <span className="text-slate-400">{project.title}</span>
              </nav>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20">
                  {CATEGORY_LABELS[project.category] ?? project.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.1]">
                  {project.year}
                </span>
                {project.highlighted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">
                    Destacado
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
                {project.title}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-8">
                {project.tagline}
              </p>

              {/* External links */}
              <div className="flex flex-wrap gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 glass-card border border-white/[0.1] hover:border-white/[0.2] text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all min-h-[40px]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Ver código
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all min-h-[40px]"
                  >
                    Demo en vivo →
                  </a>
                )}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Context ── */}
        {project.clientDesc && (
          <section className="py-16 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-[200px_1fr] gap-8">
                <AnimatedSection>
                  <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest">El cliente</p>
                </AnimatedSection>
                <AnimatedSection delay={0.08}>
                  <p className="text-slate-300 text-lg leading-relaxed">{project.clientDesc}</p>
                </AnimatedSection>
              </div>
            </div>
          </section>
        )}

        {/* ── Problem / Solution / Impact ── */}
        <section className="py-16 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

            <div className="grid lg:grid-cols-[200px_1fr] gap-8">
              <AnimatedSection>
                <p className="text-rose-400 text-xs font-semibold uppercase tracking-widest">El problema</p>
              </AnimatedSection>
              <AnimatedSection delay={0.08}>
                <p className="text-slate-300 text-lg leading-relaxed">{project.problem}</p>
              </AnimatedSection>
            </div>

            <div className="grid lg:grid-cols-[200px_1fr] gap-8">
              <AnimatedSection>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Lo que construimos</p>
              </AnimatedSection>
              <AnimatedSection delay={0.08}>
                <p className="text-slate-300 text-lg leading-relaxed">{project.solution}</p>
              </AnimatedSection>
            </div>

            <div className="grid lg:grid-cols-[200px_1fr] gap-8">
              <AnimatedSection>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Los resultados</p>
              </AnimatedSection>
              <AnimatedSection delay={0.08}>
                <p className="text-slate-300 text-lg leading-relaxed">{project.impact}</p>
              </AnimatedSection>
            </div>

          </div>
        </section>

        {/* ── Stack ── */}
        <section className="py-16 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-5">Stack tecnológico</p>
              <div className="flex flex-wrap gap-2.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 glass-card rounded-full text-slate-300 text-sm border border-white/[0.1] font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Navigation between projects ── */}
        <section className="py-16 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {prevProject ? (
                <Link
                  href={`/proyectos/${prevProject.slug}`}
                  className="group flex items-center gap-3 glass-card border border-white/[0.07] hover:border-blue-500/30 rounded-xl p-4 transition-all duration-200 max-w-[45%]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" aria-hidden="true">
                    <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-slate-600 text-xs mb-0.5">Proyecto anterior</p>
                    <p className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors truncate">{prevProject.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextProject ? (
                <Link
                  href={`/proyectos/${nextProject.slug}`}
                  className="group flex items-center gap-3 glass-card border border-white/[0.07] hover:border-blue-500/30 rounded-xl p-4 transition-all duration-200 max-w-[45%] text-right ml-auto"
                >
                  <div>
                    <p className="text-slate-600 text-xs mb-0.5">Siguiente proyecto</p>
                    <p className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors truncate">{nextProject.title}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* CTA */}
            <AnimatedSection className="text-center mt-12">
              <p className="text-slate-400 mb-4">¿Quieres algo similar para tu negocio?</p>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm min-h-[44px] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Hablemos →
              </Link>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
