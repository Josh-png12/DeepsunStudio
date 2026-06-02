'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'

const NAV_ITEMS = [
  { key: 'nav.about',      href: '#about'      },
  { key: 'nav.projects',   href: '#projects'   },
  { key: 'nav.experience', href: '#experience' },
  { key: 'nav.skills',     href: '#skills'     },
  { key: 'nav.contact',    href: '#contact'    },
] as const

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { scrollYProgress } = useScroll()
  const scrollSpring = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  const [scrolled, setScrolled]     = useState(false)
  const [visible, setVisible]       = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastY = useRef(0)

  // Scroll direction + glassmorphism
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      if (y < 80) {
        setVisible(true)
      } else if (y > lastY.current + 6) {
        setVisible(false)
        setMobileOpen(false)
      } else if (y < lastY.current - 6) {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize → desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Body scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false)
    requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

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
      {/* Scroll progress bar — 3px, suavizado con spring */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
        style={{ scaleX: scrollSpring, willChange: 'transform' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <button
            onClick={() => handleNavClick('#hero')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            className="group outline-none"
            aria-label="Volver al inicio"
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
          </button>

          {/* Desktop nav — visible at lg+ */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navegación principal">
            {NAV_ITEMS.map(({ key, href }) => (
              <button
                key={key}
                onClick={() => handleNavClick(href)}
                className="relative px-3.5 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04] font-medium group outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              >
                {t(key)}
                <span className="absolute bottom-1.5 left-3.5 right-3.5 h-px bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-[250ms] origin-left" />
              </button>
            ))}
          </nav>

          {/* Right: lang toggle + CTA + hamburger */}
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

            {/* Desktop CTA — visible at lg+ */}
            <button
              onClick={() => handleNavClick('#contact')}
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors duration-200 shadow-[0_0_18px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] min-h-[36px]"
            >
              Hablemos
            </button>

            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden flex flex-col gap-[5px] items-center justify-center w-11 h-11 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                className="block h-px w-[18px] bg-white origin-center"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                className="block h-px w-[18px] bg-white"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                className="block h-px w-[18px] bg-white origin-center"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
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
                {NAV_ITEMS.map(({ key, href }, i) => (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    <button
                      onClick={() => handleNavClick(href)}
                      className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all duration-200 text-base font-medium min-h-[44px] outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    >
                      {t(key)}
                    </button>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_ITEMS.length * 0.05 + 0.05, duration: 0.25 }}
                className="mt-4 pt-4 border-t border-white/[0.06]"
              >
                <button
                  onClick={() => handleNavClick('#contact')}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors duration-200 text-sm min-h-[44px] shadow-[0_0_24px_rgba(59,130,246,0.3)]"
                >
                  Quiero un sitio web →
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
