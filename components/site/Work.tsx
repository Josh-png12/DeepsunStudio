'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { UI, WORK, type Cat } from '@/lib/site-content'
import type { CaseView } from '@/lib/site-cases'
import ProjectVisual from './ProjectVisual'

type Filter = 'all' | Cat
const FILTERS: Filter[] = ['all', 'client', 'system', 'automation']

export default function Work({ cases, heading = true }: { cases: CaseView[]; heading?: boolean }) {
  const { tr, lang } = useSite()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = cases.filter((c) => filter === 'all' || c.meta.cat === filter)
  const big = visible.filter((c) => c.meta.visual !== 'scraper' && c.meta.visual !== 'users')
  const more = visible.filter((c) => c.meta.visual === 'scraper' || c.meta.visual === 'users')

  return (
    <section className="work" id="trabajo">
      <div className="wrap">
        {!heading && <h2 className="sr-only">{tr({ es: 'Casos de estudio', en: 'Case studies' })}</h2>}
        {heading && (
          <div className="section-top">
            <div>
              <div className="eyebrow">{tr(WORK.eyebrow)}</div>
              <Rich as="h2" v={WORK.title} />
            </div>
            <p>{tr(WORK.intro)}</p>
          </div>
        )}
        <div className="filterbar" role="group" aria-label={tr(WORK.filterLabel)}>
          {FILTERS.filter((f) => f === 'all' || cases.some((c) => c.meta.cat === f)).map((f) => (
            <button key={f} type="button" className={filter === f ? 'active' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {tr(WORK.filters[f])}
            </button>
          ))}
        </div>

        {big.map((c, i) => (
          <article className="project" key={c.meta.slug}>
            <div className="project-header">
              <div>
                <div className="project-counter">{String(i + 1).padStart(2, '0')} / {tr(c.meta.kind)}</div>
                <Rich as="h3" v={c.meta.title} />
                <p>{tr(c.meta.pitch)}</p>
              </div>
              <Link className="project-link" href={`/proyectos/${c.meta.slug}`}>
                <span>{tr(UI.caseStudy)}</span> ↗
              </Link>
            </div>
            <ProjectVisual visual={c.meta.visual} label={`${c.project.title} — ${lang === 'es' ? 'reinterpretación conceptual' : 'conceptual interpretation'}`} />
          </article>
        ))}

        <div className="tiny work-note">{tr(WORK.note)}</div>

        {more.length > 0 && (
          <div className="morework">
            {more.map((c) => (
              <Link className="more-item" key={c.meta.slug} href={`/proyectos/${c.meta.slug}`}>
                <div>
                  <span className="tiny">{tr(c.meta.kind)}</span>
                  <h4>{c.project.title.toUpperCase()}</h4>
                  <p>{tr(c.meta.pitch)}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
