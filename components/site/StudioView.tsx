'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { STUDIO as S, UI } from '@/lib/site-content'
import PageHead from './PageHead'

export default function StudioView() {
  const { tr } = useSite()
  return (
    <>
      <PageHead eyebrow={S.eyebrow} title={S.title} lead={S.lead}>
        <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
          <Link className="btn" href="/servicios"><span>{tr({ es: 'Ver servicios', en: 'See services' })}</span><span className="arrow" aria-hidden="true">↗</span></Link>
          <Link className="btn light outline" href="/proyectos"><span>{tr(UI.allWork)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
        </div>
      </PageHead>

      <section className="page-section cream">
        <div className="wrap">
          <div className="eyebrow">{tr(S.problemEyebrow)}</div>
          <Rich as="h2" className="h2-big" v={S.problemTitle} />
          <div className="trio">
            {S.problems.map((p, i) => (
              <div key={i}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{tr(p.h)}</h3>
                <p>{tr(p.p)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section sand">
        <div className="wrap">
          <div className="eyebrow">{tr(S.whoEyebrow)}</div>
          <Rich as="h2" className="h2-big" v={S.whoTitle} />
          <div className="who">
            <div>
              <p>{tr(S.who1)}</p>
              <p>{tr(S.who2)}</p>
            </div>
            <div>
              <div className="stats">
                {S.stats.map((s) => (
                  <div key={s.n}><b>{s.n}</b><span>{tr(s.l)}</span></div>
                ))}
              </div>
              <p className="fine">{tr(S.figures)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section sun">
        <div className="wrap">
          <div className="eyebrow">{tr(S.sectorsEyebrow)}</div>
          <Rich as="h2" className="h2-big" v={S.sectorsTitle} />
          <div className="sectors">
            {S.sectors.map((s, i) => (
              <div className="sector" key={i}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{tr(s.n)}</h3>
                <p>{tr(s.d)}</p>
              </div>
            ))}
          </div>
          <div className="cta-row">
            <p>{tr(S.otherSector)}</p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <Rich as="h2" className="h2-big" v={S.ctaTitle} />
          <div className="btns">
            <Link className="btn" href="/contacto"><span>{tr(UI.start)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  )
}
