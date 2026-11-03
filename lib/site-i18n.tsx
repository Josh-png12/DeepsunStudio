'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type SiteLang = 'es' | 'en'
export type L = { es: string; en: string }

const STORAGE_KEY = 'deepsun-lang'

interface Ctx {
  lang: SiteLang
  setLang: (l: SiteLang) => void
  /** Pick the string for the active language. */
  tr: (v: L) => string
}

const SiteLangContext = createContext<Ctx>({ lang: 'es', setLang: () => {}, tr: (v) => v.es })

/**
 * Spanish is rendered on the server (canonical, indexed language). The stored
 * choice, or the browser language on first visit, is applied after hydration.
 */
export function SiteLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>('es')

  useEffect(() => {
    let next: SiteLang = 'es'
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'es' || saved === 'en') next = saved
      else if (navigator.language?.toLowerCase().startsWith('en')) next = 'en'
    } catch {}
    setLangState(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: SiteLang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])

  const value = useMemo<Ctx>(() => ({ lang, setLang, tr: (v) => v[lang] }), [lang, setLang])
  return <SiteLangContext.Provider value={value}>{children}</SiteLangContext.Provider>
}

export const useSite = () => useContext(SiteLangContext)

/** Renders a bilingual string, allowing the inline <br>, <em> and <b> markup used by the editorial headlines. */
export function Rich({ v, as: Tag = 'span', className }: { v: L; as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'; className?: string }) {
  const { tr } = useSite()
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: tr(v) }} />
}
