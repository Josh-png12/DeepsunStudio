'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { HERO } from '@/lib/site-content'
import SunShards from './SunShards'
import { useSunIntro } from './useSunIntro'

export default function Hero() {
  const { tr } = useSite()
  const heroRef = useRef<HTMLElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  useSunIntro(artRef)

  // Discreet pointer parallax for the sun; disabled for touch and reduced motion.
  useEffect(() => {
    const hero = heroRef.current
    const art = artRef.current
    if (!hero || !art) return
    if (!window.matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return
    const onMove = (ev: PointerEvent) => {
      const r = hero.getBoundingClientRect()
      const dx = (ev.clientX - r.left) / r.width - 0.5
      const dy = (ev.clientY - r.top) / r.height - 0.5
      art.style.setProperty('--x', (-dx * 24).toFixed(1) + 'px')
      art.style.setProperty('--y', (-dy * 16).toFixed(1) + 'px')
    }
    hero.addEventListener('pointermove', onMove)
    return () => hero.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <section className="hero" id="inicio" aria-labelledby="hero-heading" ref={heroRef}>
        <div className="sun-art" ref={artRef} aria-hidden="true" data-intro="pending">
          <SunShards />
          <div className="sun-ring three" />
          <div className="sun-ring two" />
          <div className="sun-ring" />
          <div className="sun-disk" />
        </div>
        <div className="hero-inner">
          <div className="hero-meta">
            <Rich as="div" className="tiny" v={HERO.meta} />
            <div className="availability tiny">
              <i className="pulse" />
              <span>{tr(HERO.avail)}</span>
            </div>
          </div>
          <h1 className="hero-title" id="hero-heading">
            <span>{tr(HERO.l1)}</span>
            <span className="outline">{tr(HERO.l2)}</span>
            <span>
              <span className="highlight">{tr(HERO.l3)}</span>
              <span className="period">.</span>
            </span>
          </h1>
          <div className="hero-bottom">
            <p className="hero-desc">{tr(HERO.desc)}</p>
            <div className="hero-bottom-side">
              <Link className="btn" href="/proyectos">
                <span>{tr(HERO.cta)}</span>
                <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              <div className="scroll-index">{tr(HERO.scroll)}</div>
            </div>
          </div>
        </div>
        <div className="hero-number" aria-hidden="true">DEEPSUN / VOL. 02 — 2026</div>
      </section>
      <div className="hero-marquee" aria-hidden="true">
        <div className="marquee-track">
          <Rich v={HERO.marquee} />
          <Rich v={HERO.marquee} />
        </div>
      </div>
    </>
  )
}
