'use client'

import { useSite } from '@/lib/site-i18n'
import { whatsappHref } from '@/lib/site'

const TEXT = {
  es: 'Hola DeepSun, quisiera hablar sobre un proyecto.',
  en: 'Hi DeepSun, I would like to talk about a project.',
}

/** Floating WhatsApp button; the number comes from lib/site.ts (single source). */
export default function WhatsAppFab() {
  const { lang } = useSite()
  const href = whatsappHref(TEXT[lang])
  if (!href) return null
  const label = lang === 'es' ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp'
  return (
    <aside aria-label="WhatsApp">
      <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" title={label}>
        WhatsApp <span aria-hidden="true">↗</span>
      </a>
    </aside>
  )
}
