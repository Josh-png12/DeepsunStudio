'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { PROJECTS_PAGE as PP, UI } from '@/lib/site-content'
import type { CaseView } from '@/lib/site-cases'
import PageHead from './PageHead'
import Work from './Work'

export default function ProyectosView({ cases }: { cases: CaseView[] }) {
  const { tr } = useSite()
  return (
    <>
      <PageHead eyebrow={PP.eyebrow} title={PP.title} lead={PP.intro} />
      <Work cases={cases} heading={false} />
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
