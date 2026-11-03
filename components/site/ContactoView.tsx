'use client'

import { useSite } from '@/lib/site-i18n'
import { BRIEF as B, CONTACT as C } from '@/lib/site-content'
import { SITE, WHATSAPP_DISPLAY, mailtoHref, whatsappHref } from '@/lib/site'
import PageHead from './PageHead'
import BriefForm from './BriefForm'

export default function ContactoView() {
  const { tr } = useSite()
  const wa = whatsappHref(tr(C.waText))
  return (
    <>
      <PageHead eyebrow={B.eyebrow} title={B.title} lead={B.intro} />
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
          <BriefForm />
        </div>
      </section>
    </>
  )
}
