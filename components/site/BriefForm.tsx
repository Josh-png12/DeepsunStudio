'use client'

import { useRef, useState, useEffect } from 'react'
import { useSite, type L } from '@/lib/site-i18n'
import { BRIEF as B } from '@/lib/site-content'
import { isEmail, submitLead } from '@/lib/leads'
import { whatsappHref } from '@/lib/site'

type Step = 1 | 2 | 3 | 4 | 5
type Opt = { v: string; l: L }

function Option({ opt, selected, multi, onPick }: { opt: Opt; selected: boolean; multi?: boolean; onPick: () => void }) {
  const { tr } = useSite()
  return (
    <button
      type="button"
      className="opt"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onPick}
    >
      <span className={`box${multi ? '' : ' round'}`} aria-hidden="true">{selected ? '✳' : ''}</span>
      <span>{tr(opt.l)}</span>
    </button>
  )
}

/** Five-step brief → real insert into `leads`. Success is shown only after Supabase confirms. */
export default function BriefForm() {
  const { tr } = useSite()
  const [step, setStep] = useState<Step>(1)
  const [businessType, setBusinessType] = useState('')
  const [needs, setNeeds] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const openedAt = useRef(0)
  useEffect(() => { openedAt.current = Date.now() }, [])
  const head = useRef<HTMLDivElement>(null)

  const can = step === 1 ? !!businessType : step === 2 ? needs.length > 0 : step === 3 ? !!budget : step === 4 ? !!timeline : true
  const go = (s: Step) => {
    setStep(s)
    head.current?.scrollIntoView({ block: 'nearest' })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get('website') || Date.now() - openedAt.current < 4000) return // honeypot + minimum fill time
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    if (name.length < 2 || !isEmail(email)) return setError(tr(B.required))
    setError('')
    setStatus('sending')
    const res = await submitLead({
      business_type: businessType,
      needs,
      budget,
      timeline,
      name,
      email,
      whatsapp: String(fd.get('whatsapp') ?? '').trim() || null,
      message: String(fd.get('message') ?? '').trim() || null,
    })
    if (res.ok) setStatus('done')
    else {
      setError(tr(res.reason === 'throttled' ? B.throttled : B.error))
      setStatus('idle')
    }
  }

  if (status === 'done') {
    const wa = whatsappHref(tr({ es: 'Hola DeepSun, acabo de enviar el formulario de contacto.', en: 'Hi DeepSun, I just sent the contact form.' }))
    return (
      <div className="done" role="status">
        <h2>{tr(B.doneTitle)}</h2>
        <p>{tr(B.doneBody)}</p>
        {wa && (
          <p style={{ marginTop: 28 }}>
            <span className="tiny" style={{ display: 'block', marginBottom: 10 }}>{tr(B.urgent)}</span>
            <a className="project-link" href={wa} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span> ↗</a>
          </p>
        )}
      </div>
    )
  }

  const q = [null, [B.q1, B.q1h], [B.q2, B.q2h], [B.q3, B.q3h], [B.q4, B.q4h], [B.q5, B.q5h]][step]!

  return (
    <div>
      <div className="progress" aria-hidden="true"><i style={{ width: `${(step / 5) * 100}%` }} /></div>
      <div className="step-count" ref={head}>
        <span>{tr(B.step)} {step} {tr(B.of)} 5</span>
        <span>{Math.round((step / 5) * 100)}%</span>
      </div>

      {step < 5 ? (
        <div role={step === 2 ? 'group' : 'radiogroup'} aria-labelledby="brief-q">
          <h2 id="brief-q">{tr(q[0])}</h2>
          <p className="hint">{tr(q[1])}</p>
          <div className={`opts${step === 1 ? '' : ' one'}`}>
            {step === 1 && B.business.map((o) => <Option key={o.v} opt={o} selected={businessType === o.v} onPick={() => setBusinessType(o.v)} />)}
            {step === 2 && B.needs.map((o) => <Option key={o.v} opt={o} multi selected={needs.includes(o.v)} onPick={() => setNeeds((n) => (n.includes(o.v) ? n.filter((x) => x !== o.v) : [...n, o.v]))} />)}
            {step === 3 && B.budgets.map((o) => <Option key={o.v} opt={o} selected={budget === o.v} onPick={() => setBudget(o.v)} />)}
            {step === 4 && B.timelines.map((o) => <Option key={o.v} opt={o} selected={timeline === o.v} onPick={() => setTimeline(o.v)} />)}
          </div>
          <div className="step-nav">
            <button className="linkbtn" type="button" disabled={step === 1} onClick={() => go((step - 1) as Step)}>{tr(B.back)}</button>
            <button className="btn dark" type="button" disabled={!can} onClick={() => can && go((step + 1) as Step)}>
              <span>{tr(B.next)}</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <h2>{tr(q[0])}</h2>
          <p className="hint">{tr(q[1])}</p>
          <label htmlFor="b-name">{tr(B.name)} *</label>
          <input id="b-name" name="name" required autoComplete="name" maxLength={120} />
          <label htmlFor="b-email">{tr(B.email)} *</label>
          <input id="b-email" name="email" type="email" required autoComplete="email" maxLength={160} />
          <label htmlFor="b-wa">{tr(B.wa)}</label>
          <input id="b-wa" name="whatsapp" type="tel" autoComplete="tel" maxLength={40} />
          <label htmlFor="b-msg">{tr(B.msg)}</label>
          <textarea id="b-msg" name="message" rows={4} maxLength={2000} />
          <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {error && <p className="form-note bad" role="alert" style={{ marginBottom: 18 }}>{error}</p>}
          <div className="step-nav" style={{ marginTop: 10 }}>
            <button className="linkbtn" type="button" onClick={() => go(4)}>{tr(B.back)}</button>
            <button className="btn" type="submit" disabled={status === 'sending'}>
              <span>{tr(status === 'sending' ? B.sending : B.submit)}</span>
              <span className="arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
