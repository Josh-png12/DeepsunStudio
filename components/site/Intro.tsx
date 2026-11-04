'use client'

import { useSite, Rich } from '@/lib/site-i18n'
import { INTRO } from '@/lib/site-content'
import { SHOW_UNVERIFIED_FIGURES } from '@/lib/launch'

export default function Intro() {
  const { tr } = useSite()
  return (
    <section className="intro" id="estudio">
      <div className="intro-top">
        <div className="eyebrow">{tr(INTRO.eyebrow)}</div>
        <div className="tiny">{tr(INTRO.tag)}</div>
      </div>
      <Rich as="h2" className="intro-statement" v={INTRO.statement} />
      <div className="intro-foot">
        <p>{tr(INTRO.body)}</p>
        <div className="seal">
          <span className="asterisk" aria-hidden="true">✳</span>
          <Rich v={INTRO.seal} />
        </div>
      </div>
      {SHOW_UNVERIFIED_FIGURES && (
        <div className="proof" aria-label={tr(INTRO.proofLabel)}>
          {INTRO.proof.map((p) => (
            <div className="proof-item" key={p.n}>
              <div className="proof-num">{p.n}</div>
              <div className="proof-label">{tr(p.label)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
