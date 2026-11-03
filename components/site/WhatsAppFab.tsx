'use client'

import { useSite } from '@/lib/site-i18n'
import { whatsappHref } from '@/lib/site'

const TEXT = {
  es: 'Hola DeepSun, quisiera hablar sobre un proyecto.',
  en: 'Hi DeepSun, I would like to talk about a project.',
}

/** Renders nothing until NEXT_PUBLIC_WHATSAPP_NUMBER is configured (see lib/site.ts). */
export default function WhatsAppFab() {
  const { lang } = useSite()
  const href = whatsappHref(TEXT[lang])
  if (!href) return null
  const label = lang === 'es' ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp'
  return (
    <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
      <span aria-hidden="true">WA ↗</span>
    </a>
  )
}
