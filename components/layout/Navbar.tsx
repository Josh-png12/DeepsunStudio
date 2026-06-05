'use client'

/*
 * Hallmark · Nav archetype N1b — canonical SaaS three-section
 * genre: modern-minimal · theme: midnight + amber
 * Wordmark left · centred links · CTA right
 * Transparent at rest; frosts on scroll past 24px
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'
import { BrandMark } from '@/components/BrandMark'

const SERVICES_ITEMS = [
  { label: 'Sitios web para negocios',   href: '/servicios' },
  { label: 'Automatización & WhatsApp',  href: '/servicios' },
  { label: 'Sistemas a medida',          href: '/servicios' },
  { label: 'Software personalizado',     href: '/servicios' },
]

const NAV_LINKS = [
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contacto',  href: '/contacto'  },
]

const MOBILE_LINKS = [
  { label: 'Studio',    href: '/studio'    },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contacto',  href: '/contacto'  },
]

export default function Navbar() {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()

  const [scrolled, setScrolled]     = useState(false)
  const [visible, setVisible]        = useState(true)
  const [mobileOpen, setMobileOpen]  = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const lastY  = useRef(0)
  const svcRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (y < 80) {
        setVisible(true)
      } else if (y > lastY.current + 8) {
        setVisible(false)
        setMobileOpen(false)
        setServicesOpen(false)
      } else if (y < lastY.current - 8) {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 960) setMobileOpen(false) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (svcRef.current && !svcRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const linkStyle = (href: string) => ({
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    color: isActive(href) ? 'var(--color-ink)' : 'var(--color-muted)',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color var(--dur-short) var(--ease-out)',
    whiteSpace: 'nowrap' as const,
    minHeight: '44px',
  })

  return (
    <motion.header
      animate={{ y: visible ? 0 : '-100%' }}
      transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)',
        transition: 'background 240ms, border-color 240ms, box-shadow 240ms',
        background: scrolled
          ? 'oklch(17% 0.012 260 / 0.80)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        borderBottom: scrolled
          ? '1px solid var(--color-rule)'
          : '1px solid transparent',
        boxShadow: scrolled
          ? '0 8px 28px -18px oklch(0% 0 0 / 0.4)'
          : 'none',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--page-max)',
          margin: '0 auto',
          paddingInline: 'var(--page-gutter)',
          height: 'var(--nav-height)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >

        {/* ── Wordmark (left) ── */}
        <Link
          href="/"
          aria-label="DeepSun Studio — Inicio"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            justifySelf: 'start',
          }}
        >
          <BrandMark
            size="mark"
            color="var(--color-accent)"
          />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
            className="hidden sm:block"
          >
            DeepSun Studio
          </span>
        </Link>

        {/* ── Centre nav links (desktop ≥960px — shown via .hm-desktop-nav in globals.css) ── */}
        <nav
          aria-label="Navegación principal"
          className="hm-desktop-nav"
          style={{
            alignItems: 'center',
            gap: '2px',
            justifySelf: 'center',
          }}
        >
          {/* Services dropdown */}
          <div ref={svcRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setServicesOpen(o => !o)}
              onKeyDown={e => e.key === 'Escape' && setServicesOpen(false)}
              style={{
                ...linkStyle('/servicios'),
                color: (pathname.startsWith('/servicios') || pathname.startsWith('/studio'))
                  ? 'var(--color-ink)'
                  : 'var(--color-muted)',
              }}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
            >
              Servicios
              <motion.svg
                width="11" height="11" viewBox="0 0 12 12" fill="none"
                animate={{ rotate: servicesOpen ? 180 : 0 }}
                transition={{ duration: 0.18 }}
                aria-hidden="true"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    minWidth: '220px',
                    background: 'var(--color-paper-3)',
                    border: '1px solid var(--color-rule)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: '0 12px 40px -12px oklch(0% 0 0 / 0.5)',
                    overflow: 'hidden',
                    zIndex: 'var(--z-dropdown)',
                  }}
                >
                  <Link
                    href="/studio"
                    role="menuitem"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--color-rule)',
                      transition: 'background var(--dur-short) var(--ease-out)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-paper-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Sobre el estudio
                  </Link>
                  {SERVICES_ITEMS.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      role="menuitem"
                      style={{
                        display: 'block',
                        padding: '9px 16px',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-muted)',
                        textDecoration: 'none',
                        transition: 'color var(--dur-short) var(--ease-out), background var(--dur-short) var(--ease-out)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--color-ink)'
                        e.currentTarget.style.background = 'var(--color-paper-2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--color-muted)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={linkStyle(href)}
              onMouseEnter={e => { if (!isActive(href)) e.currentTarget.style.color = 'var(--color-ink)' }}
              onMouseLeave={e => { if (!isActive(href)) e.currentTarget.style.color = 'var(--color-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right: lang toggle + CTA + hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            aria-label="Cambiar idioma"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-rule)',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              transition: 'border-color var(--dur-short) var(--ease-out)',
              minHeight: '36px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}
          >
            <span style={{ color: lang === 'en' ? 'var(--color-accent)' : 'var(--color-faint)' }}>EN</span>
            <span style={{ color: 'var(--color-rule)', margin: '0 1px' }}>/</span>
            <span style={{ color: lang === 'es' ? 'var(--color-accent)' : 'var(--color-faint)' }}>ES</span>
          </button>

          {/* Desktop CTA */}
          <Link
            href="/contacto"
            className="btn-primary hidden lg:inline-flex"
            style={{ padding: '8px 20px', fontSize: 'var(--text-sm)', minHeight: '36px' }}
          >
            Cotizar
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="lg:hidden"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-rule)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'border-color var(--dur-short) var(--ease-out)',
            }}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
              style={{
                display: 'block',
                height: 1,
                width: 18,
                background: 'var(--color-ink)',
                borderRadius: 1,
                transformOrigin: 'center',
              }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'block',
                height: 1,
                width: 18,
                background: 'var(--color-ink)',
                borderRadius: 1,
              }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
              style={{
                display: 'block',
                height: 1,
                width: 18,
                background: 'var(--color-ink)',
                borderRadius: 1,
                transformOrigin: 'center',
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.25, 0.4, 0.25, 1] }}
            style={{
              overflow: 'hidden',
              borderTop: '1px solid var(--color-rule)',
              background: 'oklch(17% 0.012 260 / 0.96)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <nav
              aria-label="Menú móvil"
              style={{ padding: '12px var(--page-gutter) 20px' }}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {MOBILE_LINKS.map(({ label, href }, i) => (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}
                  >
                    <Link
                      href={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-card)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 500,
                        color: isActive(href) ? 'var(--color-ink)' : 'var(--color-muted)',
                        background: isActive(href) ? 'var(--color-paper-2)' : 'transparent',
                        border: isActive(href)
                          ? '1px solid var(--color-rule)'
                          : '1px solid transparent',
                        minHeight: '44px',
                        transition: 'color var(--dur-short) var(--ease-out)',
                      }}
                    >
                      {label}
                      {isActive(href) && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: MOBILE_LINKS.length * 0.04 + 0.04, duration: 0.22 }}
                style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-rule)' }}
              >
                <Link
                  href="/contacto"
                  className="btn-primary"
                  style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                  Solicitar cotización
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
