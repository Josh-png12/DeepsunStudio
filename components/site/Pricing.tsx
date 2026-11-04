'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { FAQ, PLANS, PLANS_SECTION as P, PLAN_SHORT } from '@/lib/site-content'
import { CURRENCIES, CURRENCY_KEY, formatPrice, type Currency } from '@/lib/currency'

export function FaqList() {
  const { tr } = useSite()
  return (
    <div>
      {FAQ.map((f) => (
        <details className="faq-item" key={f.q.es}>
          <summary>{tr(f.q)}</summary>
          <p>{tr(f.a)}</p>
        </details>
      ))}
    </div>
  )
}

/** `detailed` = full /servicios treatment (currency selector + inclusions). Otherwise the compact home strip. */
export default function Pricing({ detailed = false }: { detailed?: boolean }) {
  const { tr, lang } = useSite()
  const [currency, setCurrency] = useState<Currency>('USD')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null
      if (saved && CURRENCIES.includes(saved)) setCurrency(saved)
    } catch {}
  }, [])

  const pick = (c: Currency) => {
    setCurrency(c)
    try { localStorage.setItem(CURRENCY_KEY, c) } catch {}
  }
  const cur: Currency = detailed ? currency : 'USD'
  // Launch 1.0 publishes no prices: the currency selector and the exchange-rate note only make sense if some plan has one.
  const hasPrices = PLANS.some((p) => p.usd !== null)

  return (
    <section className={`pricing${detailed ? ' detailed' : ''}`} id="planes">
      <div className="wrap">
        <div className="pricing-head">
          <div>
            <div className="eyebrow">{tr(P.eyebrow)}</div>
            <Rich as="h2" v={P.title} />
          </div>
          <p>{tr(P.intro)}</p>
        </div>

        {detailed && hasPrices && (
          <div className="currency-bar">
            <span className="tiny">{tr(P.priceIn)}</span>
            <div className="chips" role="group" aria-label={tr(P.currencyLabel)}>
              {CURRENCIES.map((c) => (
                <button key={c} type="button" className={currency === c ? 'active' : ''} aria-pressed={currency === c} onClick={() => pick(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="plans">
          {PLANS.map((p) => (
            <article className="plan" key={p.key}>
              <span className="index">{tr(p.idx)}</span>
              <h3>{tr(p.name)}</h3>
              {detailed && <p className="plan-headline">{tr(p.headline)}</p>}
              <div className="price">
                {p.usd === null ? tr(P.quote) : <>{formatPrice(p.usd, cur, lang)}</>}
              </div>
              {detailed ? (
                <>
                  {p.usd === null && <p className="plan-note">{tr(P.quoteNote)}</p>}
                  <ul className="plan-features">
                    {(lang === 'es' ? p.features.es : p.features.en).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <p className="plan-ideal"><b>{tr(P.idealFor)}</b> {tr(p.ideal)}</p>
                </>
              ) : (
                <p>{tr(PLAN_SHORT[p.key])}</p>
              )}
              <Link className="btn dark" href="/contacto">
                <span>{tr(detailed ? p.cta : p.usd === null ? { es: 'Cotizar proyecto', en: 'Get a quote' } : { es: 'Conversemos', en: "Let's talk" })}</span> ↗
              </Link>
            </article>
          ))}
        </div>

        {hasPrices && <div className="price-note">{tr(P.rateNote)}</div>}
        {!detailed && (
          <div className="price-more">
            <Link className="project-link" href="/servicios">
              <span>{lang === 'es' ? 'Ver detalle de cada plan' : 'See what each plan includes'}</span> ↗
            </Link>
          </div>
        )}

        <div className="faq">
          <div>
            <div className="eyebrow">{tr(P.commonQuestions)}</div>
            <Rich as="h3" v={P.faqTitle} />
          </div>
          <FaqList />
        </div>
      </div>
    </section>
  )
}
