import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: 'DeepSun Studio — Agencia de Desarrollo Web Colombia',
  description:
    'Agencia de desarrollo web y automatización para negocios en Colombia. Sitios web, WhatsApp bots y sistemas a medida que generan resultados reales.',
}

const PROBLEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Tu competencia aparece. Tú no.',
    text: 'Cuando un cliente busca lo que tú vendes en Google, aparece tu competencia. Cada día sin sitio web es un cliente que se va con otro.',
    color: 'text-rose-400',
    glow: 'rgba(251,113,133,0.15)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    ),
    title: 'Tus clientes buscan desde el celular.',
    text: 'El 78% de búsquedas locales se hacen desde móvil. Si tu sitio no está optimizado para celular, estás perdiendo más de la mitad de tus clientes potenciales.',
    color: 'text-amber-400',
    glow: 'rgba(251,191,36,0.15)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Responder manualmente agota tu tiempo.',
    text: 'Responder los mismos mensajes de WhatsApp todos los días, cobrar manualmente, agendar por Instagram — todo eso se puede automatizar. Tu tiempo vale más.',
    color: 'text-blue-400',
    glow: 'rgba(59,130,246,0.15)',
  },
]

const SECTORS = [
  { icon: '🏨', name: 'Hoteles y turismo', desc: 'Tu hotel merece aparecer cuando alguien busca "hotel en La Guajira"' },
  { icon: '🏥', name: 'Clínicas y salud', desc: 'Pacientes que te encuentran en Google antes de llamar' },
  { icon: '🍽️', name: 'Restaurantes y comida', desc: 'Menú digital, reservas online y pedidos por WhatsApp' },
  { icon: '⚖️', name: 'Firmas y consultorios', desc: 'Credibilidad profesional desde el primer clic' },
  { icon: '🏫', name: 'Instituciones educativas', desc: 'Matrículas, comunicados y pagos — todo en un solo lugar' },
  { icon: '🏢', name: 'Empresas y startups', desc: 'Sistemas que escalan con tu negocio' },
]

const STATS = [
  { value: '10+', label: 'Proyectos entregados' },
  { value: '6+', label: 'Clientes satisfechos' },
  { value: '100%', label: 'Proyectos completados' },
  { value: '3+', label: 'Años de experiencia' },
]

export default function StudioPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-28 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-600/[0.07] rounded-full blur-[120px] translate-x-1/3 pointer-events-none" aria-hidden="true" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <div className="tag-pill mb-6 inline-flex">DeepSun Studio</div>
              <h1
                className="font-heading font-black text-white leading-tight tracking-tight mb-6"
                style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
              >
                No somos una agencia más.
              </h1>
              <p
                className="text-slate-300 font-heading font-semibold mb-5"
                style={{ fontSize: 'clamp(18px, 2.5vw, 28px)' }}
              >
                Somos el equipo técnico que tu negocio necesitaba desde el principio.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                En DeepSun Studio construimos presencia digital real para negocios que quieren crecer — no solo verse bien en internet. Desde Riohacha para Colombia y el mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/servicios"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-[0_0_28px_rgba(59,130,246,0.32)] hover:shadow-[0_0_42px_rgba(59,130,246,0.52)] text-sm min-h-[44px]"
                >
                  Ver nuestros servicios
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="https://wa.me/573971496476?text=Hola%20Joshua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 glass-card border border-white/[0.1] hover:border-white/[0.18] text-slate-300 hover:text-white font-semibold rounded-2xl transition-all duration-200 text-sm min-h-[44px]"
                >
                  Hablar con Joshua
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── El problema ── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-14">
              <div className="tag-pill mb-4 inline-flex">El problema que resolvemos</div>
              <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                ¿Tu negocio existe en internet?
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {PROBLEMS.map((p, i) => (
                <AnimatedSection key={p.title} delay={i * 0.1}>
                  <div
                    className="glass-card rounded-2xl p-7 border border-white/[0.07] h-full"
                    style={{ boxShadow: `0 0 40px -12px ${p.glow}` }}
                  >
                    <div className={`mb-4 ${p.color}`}>{p.icon}</div>
                    <h3 className="font-heading font-bold text-white text-lg mb-3">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.text}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quiénes somos ── */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <AnimatedSection>
                <div className="tag-pill mb-5 inline-flex">Quiénes somos</div>
                <h2 className="font-heading font-bold text-white mb-6" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)' }}>
                  Directo al grano,<br />
                  <span className="gradient-text">sin intermediarios.</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  DeepSun Studio nació en Riohacha, La Guajira con una misión clara: que los negocios colombianos tengan la misma presencia digital que las grandes empresas, sin pagar precios de gran empresa.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  <span className="text-white font-medium">Joshua Navarro</span> lidera cada proyecto — no hay intermediarios, no hay juniors sin supervisión. Tú hablas directamente con quien construye tu solución.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((s) => (
                    <div key={s.label} className="glass-card rounded-2xl p-6 border border-white/[0.07]">
                      <p className="font-heading font-black text-white mb-1" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                        {s.value}
                      </p>
                      <p className="text-slate-500 text-sm">{s.label}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── Sectores ── */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-14">
              <div className="tag-pill mb-4 inline-flex">Sectores</div>
              <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                Sectores que atendemos
              </h2>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTORS.map((s, i) => (
                <AnimatedSection key={s.name} delay={i * 0.07}>
                  <div className="glass-card rounded-2xl p-6 border border-white/[0.07] hover:border-blue-500/20 transition-all duration-300 group">
                    <span className="text-3xl mb-3 block" role="img" aria-label={s.name}>{s.icon}</span>
                    <h3 className="font-heading font-bold text-white text-base mb-1.5 group-hover:text-blue-300 transition-colors">{s.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center mt-12">
              <p className="text-slate-400 mb-4">¿Tu sector no está aquí? Igual podemos ayudarte.</p>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm min-h-[44px]"
              >
                Cuéntanos tu caso →
              </Link>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
