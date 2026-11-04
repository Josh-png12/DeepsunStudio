'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSite, Rich } from '@/lib/site-i18n'
import { CONTACT as C, CONTACT_WA } from '@/lib/site-content'
import { FORMS_ENABLED } from '@/lib/launch'
import { SITE, WHATSAPP_DISPLAY, mailtoHref, whatsappHref } from '@/lib/site'
import { isEmail, submitLead } from '@/lib/leads'

type Status = 'idle' | 'sending' | 'ok' | 'dup' | 'error' | 'invalid' | 'throttled' | 'limited'

export function QuickForm() {
  const { tr, lang } = useSite()
  const [status, setStatus] = useState<Status>('idle')
  const openedAt = useRef(0)
  useEffect(() => { openedAt.current = Date.now() }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    // Honeypot + minimum fill time: silently drop obvious bots without telling them.
    if (fd.get('website') || Date.now() - openedAt.current < 2500) return
    const name = String(fd.get('nombre') ?? '').trim()
    const email = String(fd.get('correo') ?? '').trim()
    const idea = String(fd.get('idea') ?? '').trim()
    if (name.length < 2 || !isEmail(email) || idea.length < 10) return setStatus('invalid')
    setStatus('sending')
    const res = await submitLead({
      business_type: 'otro',
      needs: ['asesoria'],
      budget: 'no_se',
      timeline: 'explorando',
      name,
      email,
      whatsapp: null,
      message: idea,
      source: 'home_quick',
    })
    if (res.ok) {
      form.reset()
      setStatus(res.duplicate ? 'dup' : 'ok')
    } else setStatus(res.reason === 'throttled' ? 'throttled' : res.reason === 'rate_limited' || res.reason === 'paused' ? 'limited' : res.reason === 'invalid' ? 'invalid' : 'error')
  }

  const msg: Record<Exclude<Status, 'idle' | 'sending'>, string> = {
    ok: tr(C.ok),
    dup: tr(C.dup),
    limited: tr(C.limit),
    error: tr(C.err),
    invalid: tr(C.invalid),
    throttled: lang === 'es' ? 'Espera unos segundos antes de reenviar.' : 'Please wait a few seconds before sending again.',
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <label htmlFor="q-nombre">{tr(C.fName)}</label>
      <input id="q-nombre" name="nombre" required autoComplete="name" placeholder={tr(C.phName)} />
      <label htmlFor="q-correo">{tr(C.fEmail)}</label>
      <input id="q-correo" name="correo" type="email" required autoComplete="email" placeholder={tr(C.phEmail)} />
      <label htmlFor="q-idea">{tr(C.fIdea)}</label>
      <textarea id="q-idea" name="idea" required rows={3} placeholder={tr(C.phIdea)} />
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn" type="submit" disabled={status === 'sending'}>
        <span>{tr(status === 'sending' ? C.sending : C.send)}</span>
        <span className="arrow" aria-hidden="true">↗</span>
      </button>
      <span className={`form-note ${status === 'ok' || status === 'dup' ? 'ok' : status === 'idle' || status === 'sending' ? '' : 'bad'}`} role="status" aria-live="polite">
        {status !== 'idle' && status !== 'sending' ? msg[status] : tr(C.privacy)}
      </span>
    </form>
  )
}

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
