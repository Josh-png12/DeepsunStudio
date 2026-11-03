'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSite } from '@/lib/site-i18n'
import { NAV, UI } from '@/lib/site-content'
import { BrandLink } from './Brand'

export default function Nav() {
  const { lang, setLang, tr } = useSite()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="nav">
      <BrandLink label={tr(UI.homeLabel)} />
      <button
        ref={btnRef}
        className="menu-btn"
        type="button"
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen((o) => !o)}
      >
        {tr(open ? UI.menuClose : UI.menuOpen)}
      </button>
      <nav className={`nav-links${open ? ' open' : ''}`} id="nav-links" aria-label={tr(UI.navLabel)}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={pathname === n.href ? 'page' : undefined}>
            {tr(n.label)}
          </Link>
        ))}
        <div className="lang-switch" role="group" aria-label={tr(UI.langLabel)}>
          <button type="button" className={lang === 'es' ? 'active' : ''} aria-pressed={lang === 'es'} onClick={() => setLang('es')}>
            ES
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
            EN
          </button>
        </div>
        <Link className="nav-cta" href="/contacto">
          <span>{tr(UI.start)}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  )
}
