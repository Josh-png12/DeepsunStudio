'use client'

import Link from 'next/link'
import { useSite } from '@/lib/site-i18n'
import { PLANS_SECTION as P, SERVICES } from '@/lib/site-content'
import { whatsappHref } from '@/lib/site'
import PageHead from './PageHead'
import Pricing from './Pricing'

export default function ServiciosView() {
  const { tr } = useSite()
  const wa = whatsappHref(tr({ es: 'Hola DeepSun, quisiera saber cuál es el plan ideal para mi negocio.', en: 'Hi DeepSun, I would like to know which plan fits my business.' }))
  return (
    <>
      <PageHead
        eyebrow={{ es: 'SERVICIOS', en: 'SERVICES' }}
        title={{ es: 'SOLUCIONES<br>QUE <em>funcionan.</em>', en: 'SOLUTIONS<br>THAT <em>work.</em>' }}
        lead={{
          es: 'Soluciones digitales pensadas para cómo funciona tu negocio. El alcance y la inversión se definen contigo.',
          en: 'Digital solutions built around how your business works. Scope and investment are defined with you.',
        }}
      />
      <Pricing detailed />
      <section className="final-cta">
        <div className="wrap">
          <h2 className="h2-big">{tr(P.finalTitle)}</h2>
          <p>{tr(P.finalBody)}</p>
          <div className="btns">
            <Link className="btn" href="/contacto"><span>{tr(SERVICES.ctaBtn)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
            <a className="btn light outline" href={wa} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><span className="arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </>
  )
}
