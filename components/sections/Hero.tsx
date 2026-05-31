'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion, useReducedMotion, useInView, AnimatePresence,
  useScroll, useTransform, useSpring,
} from 'framer-motion'
import { useTextScramble } from '@/hooks/useTextScramble'
import { MagneticButton } from '@/lib/MagneticButton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import ParticleCanvas from '@/components/ParticleCanvas'

// ─── Animated counter ────────────────────────────────────────────────────────

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) { setVal(target); return }
    const start = performance.now()
    const dur = 1500
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, prefersReduced])

  return <span ref={ref}>{val}{suffix}</span>
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function TypewriterLine({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true })
  const [shown, setShown] = useState('')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) { setShown(text); return }
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 38)
    return () => clearInterval(id)
  }, [inView, text, prefersReduced])

  return (
    <p ref={ref} className="text-slate-500 text-[11px] font-mono mt-4 tracking-wide">
      {shown}
      {shown.length < text.length && inView && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-px h-3 bg-blue-400 ml-0.5 align-middle"
        />
      )}
    </p>
  )
}

// ─── Service icons ────────────────────────────────────────────────────────────

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function IconGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function IconTrendingUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const HEADLINE = ['Tu', 'negocio', 'merece', 'presencia', 'digital', 'real.'] as const

const SERVICES = [
  { icon: <IconGlobe />, title: 'Sitios web para negocios', desc: 'Diseño, desarrollo y despliegue', fullDesc: 'Landing pages, e-commerce, corporativos. Mobile-first y optimizados para SEO.', glow: '59,130,246' },
  { icon: <IconChat />, title: 'Automatización & WhatsApp', desc: 'Chatbots y flujos automáticos', fullDesc: 'Respuestas automáticas, notificaciones y flujos 24/7 sin intervención.', glow: '167,139,250' },
  { icon: <IconGear />, title: 'Sistemas a medida', desc: 'Plataformas, dashboards y herramientas', fullDesc: 'Sistemas administrativos, dashboards en tiempo real y herramientas internas.', glow: '6,182,212' },
  { icon: <IconTrendingUp />, title: 'SEO & Posicionamiento', desc: 'Tu negocio visible en Google', fullDesc: 'Posicionamiento local, estructura semántica y optimización técnica.', glow: '52,211,153' },
] as const

const STATS = [
  { value: 10,  suffix: '+', label: 'Proyectos'  },
  { value: 6,   suffix: '+', label: 'Clientes'   },
  { value: 3,   suffix: '+', label: 'Años'       },
  { value: 100, suffix: '%', label: 'Dedicación' },
] as const

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ s, i, prefersReduced }: {
  s: typeof SERVICES[number]
  i: number
  prefersReduced: boolean | null
}) {
  const [hovered, setHovered] = useState(false)

  const scrollToContact = useCallback(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReduced ? 0 : 1.85 + i * 0.07, duration: prefersReduced ? 0 : 0.4 }}
      whileHover={prefersReduced ? undefined : { y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={scrollToContact}
      className="glass-card rounded-xl p-3 sm:p-3.5 cursor-pointer group relative flex items-center gap-2.5 sm:block max-h-16 sm:max-h-none overflow-hidden sm:overflow-visible"
      style={{
        boxShadow: hovered
          ? `0 0 0 1px rgba(${s.glow},0.35), 0 0 24px -4px rgba(${s.glow},0.28), inset 0 0 20px -8px rgba(${s.glow},0.12)`
          : undefined,
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <motion.span
        animate={hovered && !prefersReduced ? { rotate: 10, scale: 1.12 } : { rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-shrink-0 w-8 h-8 sm:w-fit sm:h-auto mb-0 sm:mb-2 origin-center flex items-center justify-center"
        style={{ color: `rgba(${s.glow},0.85)` }}
      >
        {s.icon}
      </motion.span>

      <div className="min-w-0">
        <p
          className="text-white text-xs font-semibold leading-snug mb-0.5"
          style={{ color: hovered ? `rgba(${s.glow},0.9)` : undefined, transition: 'color 0.2s' }}
        >
          {s.title}
        </p>
        <p className="hidden sm:block text-slate-600 text-[11px] leading-tight">{s.desc}</p>

        <AnimatePresence>
          {hovered && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-500 text-[10px] mt-1.5 overflow-hidden leading-snug"
            >
              {s.fullDesc}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block text-[9px] font-semibold mt-2 tracking-wide"
              style={{ color: `rgba(${s.glow},0.7)` }}
            >
              Contactar →
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export default function Hero() {
  const prefersReduced = useReducedMotion()
  const displayName = useTextScramble('Joshua', 1800)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Refs
  const heroRef = useRef<HTMLElement>(null)
  const blobMouseRef = useRef({ x: 0, y: 0 })
  const blobPosRef = useRef({ x: 0, y: 0 })
  const blobElRef = useRef<HTMLDivElement>(null)

  // Scroll parallax values (always created, conditionally applied)
  const { scrollY } = useScroll()
  const nameY = useTransform(scrollY, [0, 300], [0, -30])
  const nameOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const hlScale = useTransform(scrollY, [0, 300], [1, 0.95])
  const hlOpacity = useTransform(scrollY, [0, 300], [1, 0.3])
  const nameYSpr = useSpring(nameY, { stiffness: 100, damping: 30 })
  const nameOpSpr = useSpring(nameOpacity, { stiffness: 100, damping: 30 })
  const hlScSpr = useSpring(hlScale, { stiffness: 100, damping: 30 })
  const hlOpSpr = useSpring(hlOpacity, { stiffness: 100, damping: 30 })

  // Blob cursor follower — desktop only
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024 || prefersReduced) return

    let rafId: number

    const onMove = (e: MouseEvent) => {
      blobMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      const pos = blobPosRef.current
      const tgt = blobMouseRef.current
      pos.x += (tgt.x - pos.x) * 0.025
      pos.y += (tgt.y - pos.y) * 0.025

      if (blobElRef.current && heroRef.current) {
        const r = heroRef.current.getBoundingClientRect()
        blobElRef.current.style.transform =
          `translate(${pos.x - r.left - 125}px, ${pos.y - r.top - 125}px)`
      }
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [prefersReduced])

  // Animation helpers
  const wordVariants = {
    hidden: { y: 58, clipPath: 'inset(110% 0 0 0)' },
    visible: (i: number) => ({
      y: 0,
      clipPath: 'inset(0% 0 0 0)',
      transition: {
        delay: prefersReduced ? 0 : 0.65 + i * 0.12,
        duration: prefersReduced ? 0 : 0.65,
        ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
      },
    }),
  }

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: prefersReduced ? 0 : delay, duration: prefersReduced ? 0 : 0.5 },
  })

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label="Presentación"
      className="relative min-h-screen flex flex-col justify-center pt-[80px] pb-10 sm:pt-16 sm:pb-0 overflow-hidden"
    >
      <ParticleCanvas />

      {/* Blob cursor — desktop only */}
      <div
        ref={blobElRef}
        className="absolute w-[250px] h-[250px] rounded-full pointer-events-none hidden lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
          top: 0,
          left: 0,
          zIndex: 1,
          willChange: 'transform',
          opacity: prefersReduced ? 0 : 1,
        }}
        aria-hidden="true"
      />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 right-0 w-[720px] h-[560px] bg-blue-600/[0.07] rounded-full blur-[130px] translate-x-1/3" />
        <div className="absolute bottom-0 -left-24 w-[540px] h-[440px] bg-violet-600/[0.05] rounded-full blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[280px] bg-cyan-500/[0.03] rounded-full blur-[90px]" />
      </div>

      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-0 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_300px] gap-12 xl:gap-16 items-center">

          {/* ── Left: content ── */}
          <div className="max-w-2xl">

            {/* Availability badge */}
            <motion.div {...fade(0)} className="mb-3 sm:mb-8">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.2] text-emerald-400 text-sm font-medium">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                Disponible para nuevos proyectos
              </span>
            </motion.div>

            {/* Greeting */}
            <motion.p {...fade(0.1)} className="text-slate-500 text-lg font-mono mb-2 tracking-wide">
              Hola, soy
            </motion.p>

            {/* Name — scroll parallax on desktop */}
            <motion.div style={isDesktop ? { y: nameYSpr, opacity: nameOpSpr } : {}}>
              <h1
                className="font-heading font-black leading-none mb-5 overflow-hidden"
                style={{ fontSize: 'clamp(54px, 10vw, 100px)' }}
              >
                <motion.span
                  initial={{ y: 90, clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ y: 0, clipPath: 'inset(0% 0 0 0)' }}
                  transition={{ delay: prefersReduced ? 0 : 0.15, duration: prefersReduced ? 0 : 0.75, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-white tracking-tight"
                  aria-label="Joshua"
                >
                  {displayName}
                </motion.span>
              </h1>
            </motion.div>

            {/* Headline — scroll parallax on desktop */}
            <motion.div style={isDesktop ? { scale: hlScSpr, opacity: hlOpSpr } : {}}>
              <h2
                className="font-heading font-bold flex flex-wrap gap-x-[0.28em] mb-7 leading-[1.12]"
                style={{ fontSize: 'clamp(32px, 6vw, 72px)' }}
                aria-label="Tu negocio merece presencia digital real"
              >
                {HEADLINE.map((word, i) => (
                  <div key={`${word}-${i}`} className="overflow-hidden" style={{ paddingBottom: '0.06em' }}>
                    <motion.span
                      className={`block ${i >= 3 ? 'gradient-flow' : 'text-white'}`}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={wordVariants}
                    >
                      {word}
                    </motion.span>
                  </div>
                ))}
              </h2>
            </motion.div>

            {/* Mobile card — after headline, no floatY */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 1.1, duration: 0.4 }}
              className="block md:hidden mb-4"
              aria-hidden="true"
            >
              <div className="glass-card rounded-xl py-2.5 px-3.5 border border-amber-400/[0.15] inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-[10px] font-semibold">LUFE Art Tattoo ✓</p>
                  <p className="text-slate-500 text-[9px]">Cliente real · Next.js · SEO · Booking</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p {...fade(1.35)} className="text-slate-400 leading-relaxed mb-10 max-w-xl" style={{ fontSize: 'clamp(15px, 2vw, 18px)' }}>
              Diseño y desarrollo sitios web, plataformas y automatizaciones que generan resultados concretos —{' '}
              <span className="text-slate-300 font-medium">no solo se ven bien.</span>{' '}
              Trabajo con negocios en La Guajira y toda Colombia.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fade(1.55)} className="flex flex-col sm:flex-row gap-3 mb-14">
              <MagneticButton
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-[0_0_28px_rgba(59,130,246,0.32)] hover:shadow-[0_0_42px_rgba(59,130,246,0.52)] text-sm min-h-[44px] will-change-transform"
              >
                Quiero un sitio web
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </MagneticButton>

              <MagneticButton
                href="#projects"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.18] text-slate-300 hover:text-white font-semibold rounded-2xl transition-all duration-200 text-sm min-h-[44px] will-change-transform"
              >
                Ver proyectos
              </MagneticButton>
            </motion.div>

            {/* Services grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: prefersReduced ? 0 : 1.75, duration: 0.4 }}>
              <p className="text-[11px] text-slate-600 uppercase tracking-[0.14em] mb-3 font-semibold">
                Servicios
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {SERVICES.map((s, i) => (
                  <ServiceCard key={s.title} s={s} i={i} prefersReduced={prefersReduced} />
                ))}
              </div>
              <TypewriterLine text="¿No sabes cuál necesitas? → Escríbeme y te asesoro gratis." />
            </motion.div>
          </div>

          {/* ── Right column: 3 floating cards — desktop only ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: prefersReduced ? 0 : 1.0, duration: prefersReduced ? 0 : 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="hidden lg:flex flex-col gap-4 self-center"
            aria-hidden="true"
          >
            {/* Card 1 — LUFE */}
            <motion.div
              animate={prefersReduced ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card rounded-2xl p-5 border border-amber-400/[0.18]"
              style={{ willChange: 'transform' }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Cliente real</span>
              </div>
              <p className="text-white text-sm font-semibold mb-0.5">LUFE Art Tattoo</p>
              <p className="text-slate-500 text-xs">Proyecto reciente · 2024 ✓</p>
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {['Next.js', 'SEO', 'Booking'].map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 text-[10px] border border-white/[0.07]">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 2 — Fundación */}
            <motion.div
              animate={prefersReduced ? undefined : { y: [0, 11, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="glass-card rounded-2xl p-4 ml-8"
              style={{ willChange: 'transform' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-medium">En producción</span>
              </div>
              <p className="text-white text-sm font-semibold">Fundación Vida Amor y Salud</p>
              <p className="text-slate-500 text-xs mt-0.5">Plataforma digital · 2023</p>
            </motion.div>

            {/* Card 3 — stat */}
            <motion.div
              animate={prefersReduced ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="glass-card rounded-2xl p-4 -ml-2"
              style={{ willChange: 'transform' }}
            >
              <p className="font-heading font-black text-2xl text-white leading-none mb-0.5">✓ 100%</p>
              <p className="text-slate-500 text-xs">Proyectos entregados</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Tablet card — shown md but not lg, Card 1 with floatY at 0.85 scale */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 1.8, duration: 0.4 }}
          className="hidden md:flex lg:hidden mt-8"
          aria-hidden="true"
        >
          <motion.div
            animate={!isMobile && !prefersReduced ? { y: [0, -12, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-card rounded-2xl p-4 border border-amber-400/[0.15] flex items-center gap-3"
            style={{ transform: 'scale(0.85)', transformOrigin: 'left center', willChange: 'transform' }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">LUFE Art Tattoo ✓</p>
              <p className="text-slate-500 text-xs mt-0.5">Cliente real · Next.js · SEO · Booking</p>
            </div>
            <div className="flex gap-1.5 ml-4">
              {['Next.js', 'SEO', 'Booking'].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 text-[10px] border border-white/[0.07]">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 2.2, duration: prefersReduced ? 0 : 0.5 }}
          className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-heading font-black text-2xl sm:text-3xl text-white leading-none">
                <Counter target={s.value} suffix={s.suffix} />
              </span>
              <span className="text-slate-500 text-xs sm:text-sm">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReduced ? 0 : 2.7, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-700"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.16em] uppercase font-mono">scroll</span>
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-slate-700 to-transparent"
        />
      </motion.div>
    </section>
  )
}
