'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'

const SERVICES_DROPDOWN = [
  { label: 'Sitios web para negocios', href: '/servicios' },
  { label: 'Automatización & WhatsApp', href: '/servicios' },
  { label: 'Sistemas a medida', href: '/servicios' },
  { label: 'Software personalizado', href: '/servicios' },
]

const NAV_LINKS = [
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
]

const MOBILE_LINKS = [
  { label: 'Studio', href: '/studio' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
]

export default function Navbar() {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const scrollSpring = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const lastY = useRef(0)
  const servicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      if (y < 80) {
        setVisible(true)
      } else if (y > lastY.current + 6) {
        setVisible(false)
        setMobileOpen(false)
        setServicesOpen(false)
      } else if (y < lastY.current - 6) {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close services dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <motion.header
      animate={{ y: visible ? 0 : '-100%' }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-[background,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'bg-[#08091a]/90 backdrop-blur-[16px] border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.03)]'
          : 'bg-transparent'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Scroll progress bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
        style={{ scaleX: scrollSpring, willChange: 'transform' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            className="group outline-none"
            aria-label="DeepSun Studio — Inicio"
          >
            <img
              src="/logo.png"
              alt="DeepSun Studio"
              style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
            />
            <span
              style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', color: 'white' }}
              className="hidden sm:block group-hover:text-blue-400 transition-colors duration-200"
            >
              DeepSun Studio
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navegación principal">

            {/* Servicios with dropdown */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => setServicesOpen((o) => !o)}
                onKeyDown={(e) => e.key === 'Escape' && setServicesOpen(false)}
                className={`relative flex items-center gap-1 px-3.5 py-2 text-sm transition-colors duration-200 rounded-lg hover:bg-white/[0.04] font-medium group outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                  pathname.startsWith('/servicios') || pathname.startsWith('/studio')
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
              >
                Servicios
                <motion.svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  animate={{ rotate: servicesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
                {(pathname.startsWith('/servicios') || pathname.startsWith('/studio')) && (
                  <span className="absolute bottom-1.5 left-3.5 right-3.5 h-px bg-blue-500 scale-x-100" />
                )}
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 mt-1.5 w-64 glass rounded-xl border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
                    role="menu"
                  >
                    <Link
                      href="/studio"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border-b border-white/[0.06]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400" aria-hidden="true">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span className="font-medium text-slate-300">Sobre el estudio</span>
                    </Link>
                    {SERVICES_DROPDOWN.map(({ label, href }) => (
                      <Link
                        key={label}
                        href={href}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
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
                className={`relative px-3.5 py-2 text-sm transition-colors duration-200 rounded-lg hover:bg-white/[0.04] font-medium outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                  isActive(href) ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-1.5 left-3.5 right-3.5 h-px bg-blue-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: lang + CTA + hamburger */}
          <div className="flex items-center gap-2.5">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 text-xs font-semibold text-slate-400 hover:text-white outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label="Cambiar idioma"
            >
              <span className={lang === 'en' ? 'text-blue-400' : 'text-slate-500'}>EN</span>
              <span className="text-slate-700 mx-0.5">/</span>
              <span className={lang === 'es' ? 'text-blue-400' : 'text-slate-500'}>ES</span>
            </button>

            {/* Desktop CTA */}
            <Link
              href="/contacto"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors duration-200 shadow-[0_0_18px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] min-h-[36px]"
            >
              Cotizar
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden flex flex-col gap-[5px] items-center justify-center w-11 h-11 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }} className="block h-px w-[18px] bg-white origin-center" />
              <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.15 }} className="block h-px w-[18px] bg-white" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }} className="block h-px w-[18px] bg-white origin-center" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
            className="lg:hidden overflow-hidden border-t border-white/[0.06] bg-[#08091a]/96 backdrop-blur-[18px]"
          >
            <nav className="px-4 pt-3 pb-5" aria-label="Menú móvil">
              <ul className="flex flex-col gap-1" role="list">
                {MOBILE_LINKS.map(({ label, href }, i) => (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={href}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium min-h-[44px] outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                        isActive(href)
                          ? 'text-white bg-blue-600/10 border border-blue-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {label}
                      {isActive(href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: MOBILE_LINKS.length * 0.05 + 0.05, duration: 0.25 }}
                className="mt-4 pt-4 border-t border-white/[0.06]"
              >
                <Link
                  href="/contacto"
                  className="block w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors duration-200 text-sm text-center min-h-[44px] shadow-[0_0_24px_rgba(59,130,246,0.3)]"
                >
                  Solicitar cotización →
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
