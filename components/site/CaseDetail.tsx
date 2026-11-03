'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { PROJECTS_PAGE as PP, UI } from '@/lib/site-content'
import type { CaseView } from '@/lib/site-cases'
import PageHead from './PageHead'
import ProjectVisual from './ProjectVisual'

export default function CaseDetail({ current, prev, next }: { current: CaseView; prev: CaseView; next: CaseView }) {
  const { tr, lang } = useSite()
  const { project: p, meta } = current
  const own = !p.realClient

  return (
    <>
      <PageHead eyebrow={meta.kind} title={{ es: p.title, en: p.title }} lead={p.description}>
        <div className="case-meta">
          <div><span>{tr(PP.client)}</span><b>{current.client ?? (own ? tr(PP.ownBadge) : p.title)}</b></div>
          <div><span>{tr(PP.year)}</span><b>{current.year}</b></div>
          <div><span>{tr({ es: 'Tipo', en: 'Type' })}</span><b>{tr(own ? PP.ownBadge : PP.clientBadge)}</b></div>
        </div>
      </PageHead>

      <div className="case-visual">
        <ProjectVisual visual={meta.visual} tall label={`${p.title} — ${lang === 'es' ? 'reinterpretación conceptual' : 'conceptual interpretation'}`} />
      </div>

      <section className="page-section sand" style={{ paddingTop: 70 }}>
        <div className="wrap">
          {[
            { no: '01', h: UI.problem, t: p.problem },
            { no: '02', h: UI.solution, t: p.solution },
            { no: '03', h: UI.result, t: p.impact },
          ].map((s) => (
            <div className="story" key={s.no}>
              <h2><span className="no">{s.no}</span>{tr(s.h)}</h2>
              <p>{tr(s.t)}</p>
            </div>
          ))}
          <div className="story">
            <h2><span className="no">04</span>{tr(UI.delivered)}</h2>
            <ul className="deliver">
              {p.features[lang].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          {current.demo && (
            <p style={{ margin: '26px 0 0' }}>
              <a className="project-link" href={current.demo} target="_blank" rel="noopener noreferrer"><span>{tr(UI.liveSite)}</span> ↗</a>
            </p>
          )}
          <div className="tiny" style={{ marginTop: 40 }}>{tr({ es: 'El gráfico es una reinterpretación conceptual, no una captura del producto entregado.', en: 'The graphic is a conceptual interpretation, not a screenshot of the delivered product.' })}</div>
        </div>
      </section>

      <section className="page-section cream" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="wrap">
          <nav className="case-nav" aria-label={tr(UI.related)}>
            <Link href={`/proyectos/${prev.meta.slug}`}>
              <small>← {tr(UI.prevCase)}</small>
              <strong>{prev.project.title}</strong>
            </Link>
            <Link href={`/proyectos/${next.meta.slug}`}>
              <small>{tr(UI.nextCase)} →</small>
              <strong>{next.project.title}</strong>
            </Link>
          </nav>
          <p style={{ margin: '26px 0 0' }}>
            <Link className="project-link" href="/proyectos"><span>{tr(UI.allWork)}</span> ↗</Link>
          </p>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <Rich as="h2" className="h2-big" v={PP.ctaTitle} />
          <div className="btns">
            <Link className="btn" href="/contacto"><span>{tr(UI.start)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  )
}
