'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ── Shared helpers ─────────────────────────────────────────────────────────────

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center h-7 px-3 gap-2 bg-[#16172a]/95 border-b border-white/[0.07] flex-shrink-0">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex-1 h-3.5 bg-white/[0.05] rounded text-[7px] text-slate-500 flex items-center px-2 truncate">
        {url}
      </div>
    </div>
  )
}

function Scanline() {
  return (
    <motion.div
      className="scanline-desktop absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none z-20"
      animate={{ top: ['-1%', '102%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
      aria-hidden="true"
    />
  )
}

function Shimmer({ className, accent }: { className?: string; accent: string }) {
  return (
    <div className={`relative overflow-hidden rounded ${className}`} style={{ background: accent }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
      />
    </div>
  )
}

// ── 1. LUFE Art Tattoo ─────────────────────────────────────────────────────────

function LufeMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const GOLD = 'rgba(212,175,55,'

  return (
    <motion.div
      ref={ref}
      initial={{ x: -16, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] flex flex-col"
      style={{ background: '#0b0806' }}
    >
      <Scanline />
      <BrowserChrome url="lufetattoo.com" />

      {/* Nav */}
      <div className="flex items-center px-3 h-7 border-b border-white/[0.05]" style={{ background: 'rgba(15,10,7,0.9)' }}>
        <span style={{ color: `${GOLD}0.9)` }} className="text-[9px] font-black tracking-widest">LUFE</span>
        <div className="flex gap-3 ml-auto">
          {['Galería', 'Artistas', 'Servicios'].map(item => (
            <span key={item} className="text-[7px] text-white/40">{item}</span>
          ))}
          <span className="text-[7px] px-2 py-0.5 rounded-full" style={{ background: `${GOLD}0.12)`, color: `${GOLD}0.8)` }}>
            Reservar
          </span>
        </div>
      </div>

      {/* Gallery */}
      <div className="flex-1 p-2 grid grid-cols-3 grid-rows-2 gap-1.5">
        <Shimmer className="col-span-2 row-span-2" accent={`${GOLD}0.07)`} />
        <Shimmer className="row-span-1" accent={`${GOLD}0.05)`} />
        <Shimmer className="row-span-1" accent={`${GOLD}0.06)`} />
      </div>

      {/* CTA */}
      <div className="pb-2 flex justify-center">
        <motion.div
          animate={{ boxShadow: ['0 0 8px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.45)', '0 0 8px rgba(212,175,55,0.2)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="px-4 py-1 rounded-full text-[8px] font-bold"
          style={{ background: `${GOLD}0.15)`, color: `${GOLD}0.9)`, border: `1px solid ${GOLD}0.3)` }}
        >
          ✓ Reservar cita →
        </motion.div>
      </div>

      {/* Reflection */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
      />
    </motion.div>
  )
}

// ── 2. Fundación Vida Amor y Salud ─────────────────────────────────────────────

function VolunteerCounter() {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const target = 847
    const dur = 1600
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView])

  return <span ref={ref}>{count.toLocaleString('es-CO')}</span>
}

const PROG_ICONS = [
  <svg key="h" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  <svg key="p" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  <svg key="s" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
]

function FundacionMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const GREEN = 'rgba(52,211,153,'

  return (
    <motion.div
      ref={ref}
      initial={{ x: -16, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] flex flex-col"
      style={{ background: '#060d1a' }}
    >
      <Scanline />
      <BrowserChrome url="fundacionvidasal.org" />

      {/* Hero area */}
      <div className="px-4 py-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: `${GREEN}0.8)` }} />
          <span className="text-[8px] font-bold tracking-wider" style={{ color: `${GREEN}0.7)` }}>
            FUNDACIÓN VIDA AMOR Y SALUD
          </span>
        </div>
        <div className="h-2 rounded w-2/3 mb-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-1.5 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="flex gap-2 mt-2">
          {['Donar', 'Voluntario'].map((l, i) => (
            <div key={l} className="px-2.5 py-1 rounded text-[7px] font-semibold"
              style={{ background: i === 0 ? `${GREEN}0.12)` : 'rgba(255,255,255,0.04)', color: i === 0 ? `${GREEN}0.8)` : 'rgba(255,255,255,0.4)', border: `1px solid ${i === 0 ? `${GREEN}0.2)` : 'rgba(255,255,255,0.06)'}` }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="px-4 py-1.5 border-b border-white/[0.04] flex items-center gap-2">
        <span className="text-[11px] font-black" style={{ color: `${GREEN}0.9)` }}>
          <VolunteerCounter />
        </span>
        <span className="text-[7px] text-white/40">voluntarios activos</span>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="ml-auto text-[7px]"
          style={{ color: `${GREEN}0.6)` }}
        >
          ↑ +12 este mes
        </motion.span>
      </div>

      {/* Program cards */}
      <div className="flex-1 grid grid-cols-3 gap-1.5 p-2">
        {['Salud', 'Comunidad', 'Bienestar'].map((prog, i) => (
          <div key={prog} className="rounded-lg p-2 flex flex-col items-center justify-center gap-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: `${GREEN}0.6)` }}>{PROG_ICONS[i]}</span>
            <span className="text-[7px] text-white/40 text-center">{prog}</span>
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
      />
    </motion.div>
  )
}

// ── 3. Premios La Cima ─────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, target.getTime() - Date.now())
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [target])

  return time
}

// Real future date
const EVENT_DATE = new Date('2026-12-31T20:00:00')

function FlipDigit({ value, label, isMobile }: { value: number; label: string; isMobile: boolean }) {
  const pads = (n: number) => String(n).padStart(2, '0')
  const GOLD = 'rgba(212,175,55,'

  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        initial={isMobile
          ? { opacity: 0 }
          : { rotateX: -90, opacity: 0, transformOrigin: 'top' }
        }
        animate={isMobile
          ? { opacity: 1 }
          : { rotateX: 0, opacity: 1, transformOrigin: 'top' }
        }
        transition={{ duration: isMobile ? 0.08 : 0.18, ease: 'easeOut' }}
        className="text-[14px] font-black tabular-nums leading-none"
        style={{ color: `${GOLD}0.95)`, display: 'inline-block' }}
      >
        {pads(value)}
      </motion.span>
      <span className="text-[6px] text-white/30 mt-0.5">{label}</span>
    </div>
  )
}

function PremiosMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReduced = useReducedMotion()
  const time = useCountdown(EVENT_DATE)
  const GOLD = 'rgba(212,175,55,'

  // Detect mobile in event handler for flip logic
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ x: -16, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] flex flex-col"
      style={{ background: '#060407' }}
    >
      <Scanline />
      <BrowserChrome url="premioslacima.co" />

      {/* Header with golden sweep */}
      <div className="flex flex-col items-center py-2 border-b border-white/[0.05] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${GOLD}0.06) 50%, transparent 100%)` }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />
        <motion.div
          animate={prefersReduced ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[9px] font-black tracking-[0.2em] mb-1 relative"
          style={{ color: `${GOLD}0.9)` }}
        >
          PREMIOS LA CIMA
        </motion.div>
        <div className="text-[6px] text-white/30 tracking-widest uppercase relative">Edición 2026 · Gala Oficial</div>
      </div>

      {/* Live countdown with flip */}
      <div className="flex justify-center gap-3 py-2 border-b border-white/[0.04]">
        <FlipDigit value={time.d} label="días" isMobile={isMobile} />
        <FlipDigit value={time.h} label="hrs" isMobile={isMobile} />
        <FlipDigit value={time.m} label="min" isMobile={isMobile} />
        <FlipDigit value={time.s} label="seg" isMobile={isMobile} />
      </div>

      {/* Nominee cards */}
      <div className="flex-1 grid grid-cols-3 gap-1.5 p-2">
        {['Mejor Empresa', 'Liderazgo', 'Innovación'].map((cat, i) => (
          <div key={cat} className="rounded-lg p-2 flex flex-col justify-between overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}0.12)` }}>
            <motion.div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${GOLD}0.04) 0%, transparent 60%)` }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-[6px] text-white/30 relative">{cat}</span>
            <div className="flex flex-col gap-0.5 relative">
              {[0, 1].map(j => (
                <div key={j} className="h-1 rounded-full" style={{ background: j === 0 ? `${GOLD}0.25)` : 'rgba(255,255,255,0.06)', width: j === 0 ? '80%' : '55%' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reflection */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
      />
    </motion.div>
  )
}

// ── 4. SIEPA Dashboard ─────────────────────────────────────────────────────────

const BAR_HEIGHTS = [55, 80, 40, 90, 65, 45, 75]
const ROLES = ['Admin', 'Docente', 'Est.'] as const

function SiepaMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [activeTab, setActiveTab] = useState<string>('Admin')
  const BLUE = 'rgba(96,165,250,'

  // Bar stagger: faster on mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ x: -16, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] flex flex-col"
      style={{ background: '#070b18' }}
    >
      <Scanline />
      <BrowserChrome url="siepa.edu.co/dashboard" />

      {/* Dashboard body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[22%] border-r border-white/[0.05] flex flex-col px-1.5 py-2 gap-0.5" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="text-[7px] font-bold mb-1 px-1" style={{ color: `${BLUE}0.6)` }}>SIEPA</div>
          {['Dashboard', 'Estudiantes', 'Reportes', 'Config.'].map((item, i) => (
            <div key={item} className="text-[6px] px-1.5 py-1 rounded"
              style={{ background: i === 0 ? `${BLUE}0.1)` : 'transparent', color: i === 0 ? `${BLUE}0.8)` : 'rgba(255,255,255,0.3)' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
          {/* Role tabs */}
          <div className="flex gap-1">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className="text-[6px] px-2 py-0.5 rounded transition-all duration-200"
                style={{
                  background: activeTab === role ? `${BLUE}0.15)` : 'rgba(255,255,255,0.03)',
                  color: activeTab === role ? `${BLUE}0.9)` : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${activeTab === role ? `${BLUE}0.25)` : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Bar chart */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="text-[5px] text-white/25 uppercase tracking-wider">Estudiantes activos por mes</div>
            <div className="flex-1 flex items-end gap-0.5 pb-0.5">
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : {}}
                  transition={{
                    delay: 0.3 + i * (isMobile ? 0.04 : 0.07),
                    duration: isMobile ? 0.3 : 0.5,
                    ease: 'easeOut',
                  }}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    transformOrigin: 'bottom',
                    background: i === 4 ? `${BLUE}0.7)` : `${BLUE}0.3)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="space-y-0.5">
            {[['García, M.', '10°B', '95%'], ['López, J.', '11°A', '88%'], ['Reyes, K.', '10°A', '92%']].map(([name, grade, att]) => (
              <div key={name} className="flex gap-2 text-[5.5px] text-white/30 border-b border-white/[0.04] pb-0.5">
                <span className="flex-1">{name}</span>
                <span>{grade}</span>
                <span style={{ color: `${BLUE}0.6)` }}>{att}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
      />
    </motion.div>
  )
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function ProjectMockup({ slug }: { slug: string }) {
  switch (slug) {
    case 'lufe-art-tattoo':           return <LufeMockup />
    case 'fundacion-vida-amor-salud': return <FundacionMockup />
    case 'premios-la-cima':           return <PremiosMockup />
    case 'siepa':                     return <SiepaMockup />
    default:                          return null
  }
}
