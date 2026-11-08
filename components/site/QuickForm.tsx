'use client'

import { useRef, useState, useEffect } from 'react'
import { useSite } from '@/lib/site-i18n'
import { CONTACT as C } from '@/lib/site-content'
import { isEmail, submitLead } from '@/lib/leads'

type Status = 'idle' | 'sending' | 'ok' | 'dup' | 'error' | 'invalid' | 'throttled' | 'limited'

/** Home quick-contact form. Loaded lazily by ContactBlock only when FORMS_ENABLED (it pulls in the Supabase client). */
export default function QuickForm() {
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
