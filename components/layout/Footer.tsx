'use client'

import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { EASE_OUT } from '@/lib/motion'
import { BrandMark } from '@/components/BrandMark'

const LINKS = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contacto',  href: '/contacto'  },
]

const SOCIAL = [
  {
    label: 'GitHub',
    href: 'https://github.com/Josh-png12',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joshua-navarro-rad-06ab18258',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:joshua@deepsunstudio.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const prefersReduced = useReducedMotion()

  return (
    <footer style={{
        paddingTop: 'var(--space-4xl)',
        paddingBottom: 'var(--space-2xl)',
        paddingInline: 'var(--page-gutter)',
        borderTop: '1px solid var(--color-rule)',
        background: 'var(--color-paper)',
      }}
    >
      <div ref={ref} style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>

        {/* Solar rule — brand mark on the divider */}
        <div className="hm-solar-rule" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="hm-solar-rule-node" aria-hidden="true" />
        </div>

        {/* Ft5 — Closing statement with brand mark + scroll reveal */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReduced ? 0.01 : 0.55, ease: EASE_OUT }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-4xl)',
          }}
        >
          <BrandMark
            size="large"
            color="var(--color-accent)"
            aria-hidden
          />
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              maxWidth: '18ch',
            }}
          >
            Software bien hecho.{' '}
            <span style={{ color: 'var(--color-accent)' }}>Negocios que funcionan.</span>
          </p>
        </motion.div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-xl)',
            paddingTop: 'var(--space-xl)',
            borderTop: '1px solid var(--color-rule)',
          }}
        >
          {/* Wordmark with brand mark */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            <BrandMark size="icon" color="var(--color-accent)" />
            DeepSun Studio
          </span>

          {/* Nav links */}
          <nav
            aria-label="Footer"
            style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}
          >
            {LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color var(--dur-short) var(--ease-out)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-ink)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Social + copyright */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  style={{
                    color: 'var(--color-faint)',
                    transition: 'color var(--dur-short) var(--ease-out)',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '44px',
                    padding: '0 2px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-faint)' }}
                >
                  {icon}
                </a>
              ))}
            </div>
            <p
              style={{
                color: 'var(--color-faint)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              © {year} DeepSun Studio
            </p>
          </div>
        </div>

        {/* SEO — semantic, invisible to most users */}
        <p
          aria-hidden="true"
          style={{
            marginTop: 'var(--space-xl)',
            textAlign: 'center',
            color: 'var(--color-faint)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.6,
            userSelect: 'none',
            opacity: 0.4,
          }}
        >
          Desarrollo web Colombia · Diseño web Riohacha · Automatización WhatsApp ·
          Sistemas a medida · Agencia web Colombia · Desarrollo web La Guajira
        </p>
      </div>
    </footer>
  )
}
