'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSite, Rich } from '@/lib/site-i18n'
import { REVIEWS as R } from '@/lib/site-content'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { Testimonial } from '@/types/testimonial'
import Modal from './Modal'
import ReviewForm from './ReviewForm'

type Load = 'loading' | 'ready' | 'error'

function Stars({ n }: { n: number }) {
  const v = Math.max(0, Math.min(5, Math.round(n)))
  return (
    <span className="rv-stars" role="img" aria-label={`${v}/5`}>
      {'✳'.repeat(v)}
      <span className="off">{'✳'.repeat(5 - v)}</span>
    </span>
  )
}

export default function Reviews() {
  const { tr } = useSite()
  const [items, setItems] = useState<Testimonial[]>([])
  const [load, setLoad] = useState<Load>('loading')
  const [form, setForm] = useState(false)
  const [media, setMedia] = useState<{ kind: 'image' | 'video'; src: string } | null>(null)
  const track = useRef<HTMLDivElement>(null)

  // Same query as before: only moderated rows are ever shown.
  useEffect(() => {
    let alive = true
    // A missing/failed backend must degrade to a visible error state, never crash the page.
    if (!isSupabaseConfigured()) {
      setLoad('error')
      return
    }
    try {
      createClient()
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .then(({ data, error }: { data: unknown[] | null; error: unknown }) => {
          if (!alive) return
          if (error) return setLoad('error')
          setItems((data ?? []) as Testimonial[])
          setLoad('ready')
        })
    } catch {
      setLoad('error')
    }
    return () => { alive = false }
  }, [])

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' })
  }, [])

  const closeForm = useCallback(() => setForm(false), [])
  const closeMedia = useCallback(() => setMedia(null), [])

  return (
    <section className="testimonials" id="testimonios">
      <div className="wrap">
        <div className="eyebrow">{tr(R.eyebrow)}</div>
        <Rich as="h2" className="testimonial-title" v={R.title} />
        <div className="testimonials-lead">
          <p>{tr(R.lead)}</p>
          <button className="btn dark" type="button" onClick={() => setForm(true)}>
            <span>{tr(R.leave)}</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </button>
        </div>

        {load === 'loading' && <p className="rv-status" role="status">{tr(R.loading)}</p>}
        {load === 'error' && <p className="rv-status bad" role="alert">{tr(R.loadError)}</p>}

        {load === 'ready' && items.length === 0 && (
          <div className="review-empty">
            <div className="review-empty-main">
              <span className="tiny">{tr(R.emptyTag)}</span>
              <Rich as="div" className="quote" v={R.emptyQuote} />
            </div>
            <div className="review-empty-side">
              <div className="starline" aria-hidden="true">✳ ✳ ✳</div>
              <div>
                <p>{tr(R.emptyBody)}</p>
                <span className="tiny">{tr(R.noFake)}</span>
              </div>
            </div>
          </div>
        )}

        {load === 'ready' && items.length > 0 && (
          <div className="rv-carousel" role="region" aria-roledescription="carousel" aria-label={tr(R.carousel)}>
            <div className="rv-track" ref={track} tabIndex={0}>
              {items.map((t) => (
                <figure className="rv-card" key={t.id}>
                  <Stars n={t.rating} />
                  <blockquote>{t.message}</blockquote>
                  <figcaption>
                    {t.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="rv-avatar" src={t.avatar_url} alt="" loading="lazy" width={44} height={44} />
                    )}
                    <span>
                      <b>{t.name}</b>
                      {(t.role || t.company) && <small>{[t.role, t.company].filter(Boolean).join(' · ')}</small>}
                    </span>
                  </figcaption>
                  {(t.result_image_url || t.video_url) && (
                    <div className="rv-media">
                      {t.result_image_url && <button type="button" onClick={() => setMedia({ kind: 'image', src: t.result_image_url! })}>{tr(R.viewImage)} ↗</button>}
                      {t.video_url && <button type="button" onClick={() => setMedia({ kind: 'video', src: t.video_url! })}>{tr(R.watchVideo)} ↗</button>}
                    </div>
                  )}
                </figure>
              ))}
            </div>
            {items.length > 1 && (
              <div className="rv-nav">
                <button type="button" onClick={() => scrollBy(-1)} aria-label={tr(R.prev)}>←</button>
                <button type="button" onClick={() => scrollBy(1)} aria-label={tr(R.next)}>→</button>
              </div>
            )}
          </div>
        )}

        <div className="review-actions"><span className="review-note">{tr(R.note)}</span></div>
      </div>

      {form && <ReviewForm onClose={closeForm} />}
      {media && (
        <Modal onClose={closeMedia} labelledBy="rv-media-t" wide>
          <span id="rv-media-t" hidden>{tr(media.kind === 'image' ? R.viewImage : R.watchVideo)}</span>
          {media.kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rv-full" src={media.src} alt="" />
          ) : (
            <video className="rv-full" src={media.src} controls playsInline preload="metadata" />
          )}
        </Modal>
      )}
    </section>
  )
}
