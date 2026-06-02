import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'

export const dynamic = 'force-dynamic'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto — DeepSun Studio',
  description:
    'Cuéntanos qué necesita tu negocio. Respondemos en menos de 24 horas con una propuesta concreta.',
}

const SIDEBAR_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: 'Tiempo de respuesta',
    value: 'Generalmente en menos de 2 horas',
    color: 'text-blue-400',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: 'Horario',
    value: 'Lunes a viernes 8am – 6pm COT',
    color: 'text-violet-400',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    label: 'Proyectos completados',
    value: '100% — sin excepciones',
    color: 'text-emerald-400',
  },
]

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-blue-600/[0.06] rounded-full blur-[100px] translate-x-1/3 pointer-events-none" aria-hidden="true" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <div className="tag-pill mb-5 inline-flex">Contacto</div>
              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
                Cuéntanos qué necesita tu negocio.
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                No formularios genéricos. Una conversación real que termina en una propuesta concreta.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Form + Sidebar ── */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_340px] gap-10 xl:gap-16 items-start">

              {/* Form */}
              <AnimatedSection>
                <ContactForm />
              </AnimatedSection>

              {/* Sidebar */}
              <AnimatedSection delay={0.15} className="space-y-4">
                {/* Response info */}
                <div className="glass-card rounded-2xl p-6 border border-white/[0.07] space-y-4">
                  {SIDEBAR_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 ${item.color}`}>{item.icon}</span>
                      <div>
                        <p className="text-slate-600 text-xs mb-0.5">{item.label}</p>
                        <p className="text-slate-300 text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp direct */}
                <a
                  href="https://wa.me/573971496476?text=Hola%20Joshua%2C%20vi%20tu%20portafolio%20y%20me%20interesa%20hablar%20sobre%20un%20proyecto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 glass-card border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#34d399" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-300 font-semibold text-sm group-hover:text-white transition-colors">Contacto directo</p>
                    <p className="text-slate-500 text-xs">Escríbeme por WhatsApp ahora</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>

                {/* Testimonial snippet */}
                <div className="glass-card rounded-2xl p-5 border border-white/[0.07]">
                  <div className="flex gap-1 mb-3" aria-label="5 estrellas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    "Joshua entregó exactamente lo que prometió, en el tiempo acordado. El sitio quedó mucho mejor de lo que esperaba."
                  </p>
                  <p className="text-slate-600 text-xs mt-3">— Cliente real, 2024</p>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
