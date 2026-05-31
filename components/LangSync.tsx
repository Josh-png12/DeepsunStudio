'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'

// Syncs the <html lang="..."> attribute with the active i18n language.
// Must live inside <LanguageProvider>.
export function LangSync() {
  const { lang } = useLanguage()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}
