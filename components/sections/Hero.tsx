'use client'

import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'
import Link from 'next/link'
import { staggerContainer, staggerItem, staggerItemReduced, EASE_OUT, DUR } from '@/lib/motion'
import { CursorCard } from '@/components/CursorCard'
import { BrandMark } from '@/components/BrandMark'

// ─── Arrow icon ───────────────────────────────────────────────────────────────

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Work proof cards (right column) ─────────────────────────────────────────
// Only real clients and real projects — no fabricated numbers.

const WORK_CARDS = [
  {
    client: 'LUFE Art Tattoo',
    type: 'Sitio web + Booking',
    year: '2024',
    tags: ['Next.js', 'SEO', 'Reservas'],
    status: 'En producción',
  },
  {
    client: 'Fundación Vida Amor y Salud',
    type: 'Plataforma digital',
    year: '2023',
    tags: ['Web', 'CMS'],
    status: 'En producción',
  },
  {
    client: 'Premios La Cima',
    type: 'Sitio institucional',
    year: '2024',
    tags: ['Next.js', 'Branding'],
    status: 'Entregado',
  },
] as const

function WorkCard({ card, index }: {
  card: typeof WORK_CARDS[number]
  index: number
  prefersReduced?: boolean | null
}) {
  return (
    <div
      className="p-5"
      style={{ marginLeft: index % 2 === 1 ? '1.5rem' : '0' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--color-accent)' }}
            aria-hidden="true"
          />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-accent)', letterSpacing: '0.1em' }}
          >
            {card.status}
          </span>
        </div>
        <span style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)' }}>
          {card.year}
        </span>
      </div>

      <p className="font-semibold mb-0.5" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-base)',
        color: 'var(--color-ink)',
      }}>
        {card.client}
      </p>
      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
        {card.type}
      </p>

      <div className="flex gap-1.5 flex-wrap mt-3">
        {card.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-xs"
            style={{
              background: 'var(--color-paper)',
              border: '1px solid var(--color-rule)',
              color: 'var(--color-muted)',
              fontSize: 'var(--text-xs)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { t } = useLanguage()
  const prefersReduced = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)

  // Orchestrated entrance — stagger the left column children
  const heroVariants = prefersReduced
    ? { hidden: {}, show: {} }
    : staggerContainer(0)

  const item = prefersReduced ? staggerItemReduced : staggerItem

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label="Inicio"
      className="hero-section"
      style={{ background: 'var(--color-paper)', paddingInline: 'var(--page-gutter)' }}
    >
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>

        {/* Split layout — 55/45 on desktop, stacked on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 'var(--space-3xl)',
            alignItems: 'start',
          }}
        >

          {/* ── Left: Agency value proposition — stagger entrance ── */}
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="show"
          >
            {/* Studio chip — brand mark replaces the plain dot */}
            <motion.div variants={item} style={{ marginBottom: 'var(--space-xl)' }}>
              <span className="hm-chip">
                <BrandMark size="icon" color="var(--color-accent)" />
                DeepSun Studio · Disponible
              </span>
            </motion.div>

            {/* H1 — from i18n, not hardcoded */}
            <motion.h1
              variants={item}
              className="hm-display"
              style={{ marginBottom: 'var(--space-xl)', maxWidth: '16ch' }}
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              variants={item}
              className="hm-lead"
              style={{ marginBottom: 'var(--space-2xl)', maxWidth: '52ch' }}
            >
              {t("hero.description")}
            </motion.p>

            {/* CTAs — arrow has micro-animation via .hm-arrow class */}
            <motion.div
              variants={item}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-3xl)',
              }}
            >
              <Link href="/contacto" className="btn-primary">
                {t("hero.cta.primary")}
                <span className="hm-arrow"><ArrowRight /></span>
              </Link>
              <Link href="/proyectos" className="btn-secondary">
                {t("hero.cta.projects")}
              </Link>
            </motion.div>

            {/* Stat row */}
            <motion.div
              variants={item}
              className="hero-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                paddingTop: 'var(--space-xl)',
                borderTop: '1px solid var(--color-rule)',
              }}
            >
              {[
                { value: '10+', label: 'Proyectos' },
                { value: '6+',  label: 'Clientes'  },
                { value: '3+',  label: 'Años'       },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 800,
                    color: 'var(--color-ink)',
                    lineHeight: 1,
                    marginBottom: 'var(--space-2xs)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {value}
                  </p>
                  <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Selected work proof (desktop only) — stagger in ── */}
          <motion.div
            aria-hidden="true"
            className="hidden lg:flex"
            style={{ flexDirection: 'column', gap: 'var(--space-lg)', paddingTop: 'var(--space-md)' }}
            variants={prefersReduced ? undefined : staggerContainer(0.55)}
            initial="hidden"
            animate="show"
          >
            {WORK_CARDS.map((card, i) => (
              <motion.div
                key={card.client}
                variants={prefersReduced ? undefined : staggerItem}
                whileHover={prefersReduced ? undefined : { y: -3 }}
                transition={{ duration: DUR.short, ease: EASE_OUT }}
              >
                <CursorCard className="hm-card" style={{ borderRadius: 'var(--radius-card)' }}>
                  <WorkCard card={card} index={i} prefersReduced={prefersReduced} />
                </CursorCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — minimal, no animation on reduced motion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReduced ? 0 : 1.2, duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          marginTop: 'var(--space-3xl)',
          color: 'var(--color-faint)',
        }}
        aria-hidden="true"
      >
        <span style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          scroll
        </span>
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 36,
            background: 'linear-gradient(to bottom, var(--color-rule), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
