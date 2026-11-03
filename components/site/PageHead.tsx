'use client'

import { useSite, Rich, type L } from '@/lib/site-i18n'

/** Dark editorial header for secondary pages (the home hero has its own). */
export default function PageHead({ eyebrow, title, lead, children }: { eyebrow: L; title: L; lead?: L; children?: React.ReactNode }) {
  const { tr } = useSite()
  return (
    <header className="page-head">
      <div className="page-head-inner">
        <div className="eyebrow">{tr(eyebrow)}</div>
        <Rich as="h1" className="page-title" v={title} />
        {lead && <p className="page-lead">{tr(lead)}</p>}
        {children}
      </div>
      <div className="page-head-sun" aria-hidden="true">
        <div className="sun-ring" /><div className="sun-ring two" /><div className="sun-disk" />
      </div>
    </header>
  )
}
