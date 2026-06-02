'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { CurrencySelector, AnimatedPrice, useCurrency } from '@/components/CurrencySelector'
import { motion, AnimatePresence } from 'framer-motion'

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: '¿Qué necesito para empezar?', a: 'Solo necesitas una idea clara de lo que quieres y tu información de contacto. Yo me encargo del resto.' },
  { q: '¿Cuánto tiempo tarda?', a: 'Depende del plan: desde 7 días para presencia básica hasta 3-4 meses para software personalizado. Siempre con fechas de entrega claras desde el inicio.' },
  { q: '¿Puedo pagar en cuotas?', a: 'Sí. Trabajamos con 50% al iniciar y 50% al entregar. Para proyectos grandes podemos hacer 3 cuotas.' },
  { q: '¿Qué pasa después de la entrega?', a: 'Cada plan incluye soporte post-entrega. Además ofrezco planes de mantenimiento mensual para quienes lo necesiten.' },
  { q: '¿Trabajas con negocios fuera de Colombia?', a: 'Sí. Trabajo con clientes en toda Latinoamérica y también con empresas hispanohablantes en Estados Unidos y España.' },
  { q: '¿Puedo ver trabajos anteriores?', a: 'Sí, en /proyectos están los casos de estudio completos con problema, solución e impacto de cada proyecto.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-white font-medium hover:text-blue-300 transition-colors min-h-[52px]"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-blue-400"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm leading-relaxed pb-5 pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

interface Plan {
  name: string
  tagline: string
  headline: string
  usd: number | null
  badge?: string
  highlight?: boolean
  features: string[]
  ideal: string
  ctaLabel: string
  ctaHref: string
  accentColor: string
}

const PLANS: Plan[] = [
  {
    name: 'Presencia Básica',
    tagline: 'Ideal para empezar',
    headline: 'Para el negocio que necesita existir en internet YA.',
    usd: 600,
    features: [
      'Sitio web hasta 5 páginas',
      'Diseño responsive mobile-first',
      'SEO básico (aparecer en Google)',
      'Formulario de contacto',
      'Integración WhatsApp',
      '1 ronda de revisiones',
      'Entrega en 7–10 días',
      'Dominio y hosting (primer año)',
    ],
    ideal: 'Restaurantes, tiendas, consultorios, negocios locales',
    ctaLabel: 'Quiero este plan →',
    ctaHref: '/contacto',
    accentColor: 'rgba(6,182,212,0.15)',
  },
  {
    name: 'Presencia Profesional',
    tagline: 'El más elegido',
    headline: 'Para el negocio que quiere liderar su mercado digital.',
    usd: 1500,
    badge: 'Más popular',
    highlight: true,
    features: [
      'Todo lo del plan Básico',
      'Sitio web hasta 12 páginas',
      'SEO avanzado con keywords locales',
      'Blog integrado',
      'WhatsApp bot básico',
      'Google Business Profile configurado',
      'Analytics y seguimiento de conversiones',
      '3 rondas de revisiones',
      'Entrega en 15–20 días',
      '1 mes de soporte post-entrega',
    ],
    ideal: 'Hoteles, clínicas, empresas establecidas, instituciones',
    ctaLabel: 'Quiero este plan →',
    ctaHref: '/contacto',
    accentColor: 'rgba(59,130,246,0.2)',
  },
  {
    name: 'Automatización & Bots',
    tagline: 'Ahorra 20+ horas semanales',
    headline: 'Para el negocio que pierde tiempo respondiendo lo mismo todos los días.',
    usd: 800,
    features: [
      'Bot de WhatsApp personalizado',
      'Respuestas automáticas 24/7',
      'Flujos de ventas automatizados',
      'Agendamiento automático',
      'Integración con tu sistema actual',
      'Panel de control para gestionar el bot',
      'Capacitación de uso',
      '1 mes de soporte',
    ],
    ideal: 'Cualquier negocio con alto volumen de mensajes WhatsApp',
    ctaLabel: 'Quiero este plan →',
    ctaHref: '/contacto',
    accentColor: 'rgba(52,211,153,0.15)',
  },
  {
    name: 'Software a Medida',
    tagline: 'Para necesidades únicas',
    headline: 'Tu negocio es único. Tu software también debería serlo.',
    usd: null,
    features: [
      'Plataformas administrativas',
      'Sistemas de gestión (ERP / CRM)',
      'Dashboards y analíticas',
      'APIs e integraciones',
      'Automatizaciones complejas',
      'E-commerce personalizado',
      'Apps web progresivas (PWA)',
    ],
    ideal: 'Proceso: diagnóstico → propuesta → cotización exacta → desarrollo por etapas',
    ctaLabel: 'Solicitar cotización gratuita →',
    ctaHref: '/contacto',
    accentColor: 'rgba(167,139,250,0.15)',
  },
]

function PlanCard({ plan, currency }: { plan: Plan; currency: ReturnType<typeof useCurrency>[0] }) {
  return (
    <div
      className={`relative glass-card rounded-2xl p-7 border transition-all duration-300 flex flex-col h-full ${
        plan.highlight
          ? 'border-blue-500/40 shadow-[0_0_48px_-8px_rgba(59,130,246,0.3)] scale-[1.02]'
          : 'border-white/[0.07]'
      }`}
      style={{ boxShadow: plan.highlight ? undefined : `0 0 40px -12px ${plan.accentColor}` }}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            ⭐ {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">{plan.tagline}</p>
        <h3 className="font-heading font-bold text-white text-xl mb-3">{plan.name}</h3>
        <p className="text-slate-400 text-sm leading-relaxed italic">{plan.headline}</p>
      </div>

      <div className="mb-6 pb-6 border-b border-white/[0.06]">
        <div className="font-heading font-black text-white" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
          <AnimatedPrice usd={plan.usd} currency={currency} prefix={plan.usd === null ? 'Desde' : undefined} />
        </div>
        {plan.usd === null && (
          <p className="text-slate-500 text-xs mt-1">Precio según complejidad del proyecto</p>
        )}
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-slate-400 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5 text-emerald-400" aria-hidden="true">
              <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <div className="mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <p className="text-slate-600 text-[11px] uppercase tracking-widest font-semibold mb-1">Ideal para</p>
        <p className="text-slate-400 text-xs leading-relaxed">{plan.ideal}</p>
      </div>

      <Link
        href={plan.ctaHref}
        className={`block w-full py-3.5 text-center rounded-xl font-semibold text-sm transition-all duration-200 min-h-[44px] ${
          plan.highlight
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]'
            : 'glass-card border border-white/[0.1] hover:border-white/[0.2] text-slate-300 hover:text-white'
        }`}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiciosPage() {
  const [currency, setCurrency] = useCurrency()

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <div className="tag-pill mb-5 inline-flex">Servicios y precios</div>
              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
                Soluciones digitales que generan retorno.
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                No cobramos por hacer páginas bonitas. Cobramos por resultados que impactan tu negocio.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Currency selector ── */}
        <div className="sticky top-16 z-40 py-3 bg-[#08091a]/90 backdrop-blur-[12px] border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <p className="text-slate-500 text-sm hidden sm:block">Precios en:</p>
            <CurrencySelector value={currency} onChange={setCurrency} />
            <p className="text-slate-600 text-xs hidden md:block">Tasa: 1 USD = $4.200 COP / €0.92 EUR</p>
          </div>
        </div>

        {/* ── Plans ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
              {PLANS.map((plan, i) => (
                <AnimatedSection key={plan.name} delay={i * 0.08}>
                  <PlanCard plan={plan} currency={currency} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <div className="tag-pill mb-4 inline-flex">Preguntas frecuentes</div>
              <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(24px, 3.5vw, 40px)' }}>
                Lo que todos preguntan antes de empezar
              </h2>
            </AnimatedSection>
            <AnimatedSection>
              <div className="glass-card rounded-2xl p-6 border border-white/[0.07]">
                {FAQS.map((f) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl mb-3">
                ¿Tienes dudas sobre cuál plan es el tuyo?
              </h2>
              <p className="text-slate-400 mb-8">
                Escríbeme y en 15 minutos te digo exactamente qué necesita tu negocio — sin compromiso.
              </p>
              <a
                href="https://wa.me/573971496476?text=Hola%20Joshua%2C%20vi%20los%20servicios%20y%20quiero%20saber%20cu%C3%A1l%20es%20el%20plan%20ideal%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-[0_0_28px_rgba(52,211,153,0.25)] hover:shadow-[0_0_42px_rgba(52,211,153,0.4)] text-sm min-h-[44px]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hablar con Joshua →
              </a>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
