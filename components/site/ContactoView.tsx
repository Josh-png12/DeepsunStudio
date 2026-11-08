'use client'

import dynamic from 'next/dynamic'
import { useSite } from '@/lib/site-i18n'
import { BRIEF as B, CONTACT as C, CONTACT_WA } from '@/lib/site-content'
import { FORMS_ENABLED } from '@/lib/launch'
import { WhatsAppCard } from './ContactBlock'
import { SITE, WHATSAPP_DISPLAY, mailtoHref, whatsappHref } from '@/lib/site'
import PageHead from './PageHead'

// Lazy: the brief form pulls in the Supabase client, which must not weigh on the public pages while forms are off (lib/launch.ts).
const BriefForm = dynamic(() => import('./BriefForm'))

export default function ContactoView() {
  const { tr } = useSite()
  const wa = whatsappHref(tr(C.waText))
  return (
    <>
      <PageHead eyebrow={B.eyebrow} title={B.title} lead={FORMS_ENABLED ? B.intro : CONTACT_WA.briefIntro} />
      <section className="brief-wrap">
        <div className="brief">
          <aside className="brief-side">
            <p>{tr(C.lead)}</p>
            <div className="direct-links">
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer">WHATSAPP {WHATSAPP_DISPLAY} ↗</a>}
              <a href={mailtoHref()}>{SITE.email.toUpperCase()} ↗</a>
            </div>
            <p className="tiny">{SITE.city}</p>
          </aside>
          {FORMS_ENABLED ? <BriefForm /> : <WhatsAppCard />}
        </div>
      </section>
    </>
  )
}
