'use client'

import { useSite, Rich } from '@/lib/site-i18n'
import { METHOD } from '@/lib/site-content'

export default function Method() {
  const { tr } = useSite()
  return (
    <section className="approach" id="metodo">
      <div className="approach-watermark" aria-hidden="true" />
      <div className="wrap approach-wrap">
        <div className="eyebrow">{tr(METHOD.eyebrow)}</div>
        <Rich as="h2" v={METHOD.title} />
        <div className="process">
          {METHOD.steps.map((s) => (
            <div className="process-item" key={s.n.es}>
              <div className="process-num">{tr(s.n)}</div>
              <h3>{tr(s.h)}</h3>
              <p>{tr(s.p)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
