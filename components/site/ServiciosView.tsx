'use client'

import Link from 'next/link'
import { useSite } from '@/lib/site-i18n'
import { PLANS_SECTION as P, SERVICES } from '@/lib/site-content'
import { mailtoHref, whatsappHref } from '@/lib/site'
import PageHead from './PageHead'
import Pricing from './Pricing'

export default function ServiciosView() {
  const { tr } = useSite()
  const wa = whatsappHref(tr({ es: 'Hola DeepSun, quisiera saber cuál es el plan ideal para mi negocio.', en: 'Hi DeepSun, I would like to know which plan fits my business.' }))
  return (
    <>
      <PageHead
        eyebrow={{ es: 'SERVICIOS Y PRECIOS', en: 'SERVICES & PRICING' }}
        title={{ es: 'SOLUCIONES<br>QUE <em>funcionan.</em>', en: 'SOLUTIONS<br>THAT <em>work.</em>' }}
        lead={{
          es: 'No cobramos por hacer páginas bonitas. Cobramos por resultados que impactan tu negocio.',
          en: "We don't charge for pretty pages. We charge for results that move your business.",
        }}
      />
      <Pricing detailed />
      <section className="final-cta">
        <div className="wrap">
          <h2 className="h2-big">{tr(P.finalTitle)}</h2>
          <p>{tr(P.finalBody)}</p>
          <div className="btns">
            <Link className="btn" href="/contacto"><span>{tr(SERVICES.ctaBtn)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
            {wa ? (
              <a className="btn light outline" href={wa} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><span className="arrow" aria-hidden="true">↗</span></a>
            ) : (
              <a className="btn light outline" href={mailtoHref()}><span>{tr({ es: 'Escribir por correo', en: 'Email us' })}</span><span className="arrow" aria-hidden="true">↗</span></a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
