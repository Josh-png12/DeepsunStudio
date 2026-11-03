'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { SERVICES } from '@/lib/site-content'

export default function ServicesBlock() {
  const { tr } = useSite()
  return (
    <section className="services" id="servicios">
      <div className="wrap">
        <div className="services-head">
          <div>
            <div className="eyebrow">{tr(SERVICES.eyebrow)}</div>
            <Rich as="h2" v={SERVICES.title} />
          </div>
          <p>{tr(SERVICES.intro)}</p>
        </div>
        {SERVICES.items.map((s, i) => (
          <Link className="service" href="/servicios" key={i}>
            <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="service-name">{tr(s.name)}</span>
            <span className="service-desc">{tr(s.desc)}</span>
            <span className="service-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
        <div className="service-cta">
          <Rich v={SERVICES.cta} />
          <Link className="btn dark" href="/contacto">
            <span>{tr(SERVICES.ctaBtn)}</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
