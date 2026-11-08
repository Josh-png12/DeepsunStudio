'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSite, Rich } from '@/lib/site-i18n'
import { CONTACT as C, CONTACT_WA } from '@/lib/site-content'
import { FORMS_ENABLED } from '@/lib/launch'
import { SITE, WHATSAPP_DISPLAY, mailtoHref, whatsappHref } from '@/lib/site'

// Lazy: the form pulls in the Supabase client, which must not weigh on the public pages while forms are off (lib/launch.ts).
const QuickForm = dynamic(() => import('./QuickForm'))

/** Launch 1.0: no data-collecting form; WhatsApp is the contact channel. Nothing here is ever "sent" or "received". */
export function WhatsAppCard() {
  const { tr } = useSite()
  const wa = whatsappHref(tr(C.waText))
  return (
    <div className="contact-form">
      <strong>{tr(CONTACT_WA.title)}</strong>
      <p>{tr(CONTACT_WA.body)}</p>
      <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
        <span>{tr(CONTACT_WA.cta)} · {WHATSAPP_DISPLAY}</span>
        <span className="arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  )
}

export default function ContactBlock() {
  const { tr } = useSite()
  const wa = whatsappHref(tr(C.waText))
  return (
    <section className="contact" id="contacto">
      <div className="wrap">
        <div className="eyebrow">{tr(C.eyebrow)}</div>
        <Rich as="h2" className="contact-title" v={C.title} />
        <div className="contact-grid">
          <div className="contact-side">
            <p>{tr(C.lead)}</p>
            <div className="direct-links">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer">WHATSAPP {WHATSAPP_DISPLAY} ↗</a>
              )}
              <a href={mailtoHref()}>{SITE.email.toUpperCase()} ↗</a>
            </div>
            {FORMS_ENABLED && (
              <div className="contact-mini">
                <small className="tiny">{tr(C.fullBrief)}</small>
                <strong>{tr(C.fullTitle)}</strong>
                <p>{tr(C.fullBody)}</p>
                <Link href="/contacto">{tr(C.fullCta)} ↗</Link>
              </div>
            )}
          </div>
          {FORMS_ENABLED ? <QuickForm /> : <WhatsAppCard />}
        </div>
      </div>
    </section>
  )
}
