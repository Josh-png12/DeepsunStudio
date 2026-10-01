'use client'

import {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { createClient } from '@/lib/supabase/client'
import { TestimonialCard, TestimonialCardSkeleton } from '@/components/TestimonialCard'
import { TestimonialForm } from '@/components/TestimonialForm'
import { Lightbox } from '@/components/ui/Lightbox'
import { VideoModal } from '@/components/ui/VideoModal'
import { MagneticButton } from '@/lib/MagneticButton'
import type { Testimonial } from '@/types/testimonial'

// ─── Copy (bilingual, without touching i18n.tsx) ──────────────────────────────

const COPY = {
  es: {
    tag: 'Testimonios',
    title: 'Lo que dicen nuestros clientes.',
    subtitle: 'Negocios reales que confiaron en DeepSun Studio para construir su presencia digital.',
    cta: '¿Trabajaste con nosotros? Deja tu testimonio',
    empty: 'Sé el primero en compartir tu experiencia',
    prevLabel: 'Anterior testimonio',
    nextLabel: 'Siguiente testimonio',
  },
  en: {
    tag: 'Testimonials',
    title: 'What our clients say.',
    subtitle: 'Real businesses that trusted DeepSun Studio to build their digital presence.',
    cta: 'Did we work together? Leave a testimonial',
    empty: 'Be the first to share your experience',
    prevLabel: 'Previous testimonial',
    nextLabel: 'Next testimonial',
  },
} as const

// ─── Carousel hook ────────────────────────────────────────────────────────────

const GAP = 16

function useCarousel(count: number, visibleCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxIndex = Math.max(0, count - visibleCount)
  const isPausedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)))
  }, [maxIndex])

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  const pause = useCallback(() => { isPausedRef.current = true }, [])
  const resume = useCallback(() => { isPausedRef.current = false }, [])

  // Auto-scroll every 5 s, pauses on hover
  useEffect(() => {
    if (count <= visibleCount) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) next()
    }, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [count, visibleCount, next])

  // Reset index if it goes out of bounds on resize
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex))
  }, [maxIndex])

  return { currentIndex, goTo, next, prev, pause, resume, maxIndex }
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Testimonials() {
  const { lang } = useLanguage()
  const copy = COPY[lang as keyof typeof COPY] ?? COPY.es
  const prefersReduced = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const visibleCount = isMobile ? 1 : isTablet ? 2 : 3
  const displayList = isLoading ? ([] as Testimonial[]) : testimonials
  const totalCards = isLoading ? 3 : Math.max(displayList.length, 0)

  const { currentIndex, goTo, next, prev, pause, resume, maxIndex } = useCarousel(
    totalCards,
    visibleCount,
  )

  // Measure container width for pixel-accurate translateX
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(() => {
      setContainerWidth(containerRef.current?.offsetWidth ?? 0)
    })
    obs.observe(containerRef.current)
    setContainerWidth(containerRef.current.offsetWidth)
    return () => obs.disconnect()
  }, [])

  const cardWidth = containerWidth > 0
    ? (containerWidth - (visibleCount - 1) * GAP) / visibleCount
    : 0
  const translateX = -(currentIndex * (cardWidth + GAP))

  // Touch swipe
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  // Fetch testimonials from Supabase
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const { data, error } = await createClient()
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) setTestimonials(data as Testimonial[])
      setIsLoading(false)
    }
    load()
  }, [])

  const showSkeletons = isLoading
  const showEmpty = !isLoading && testimonials.length === 0

  return (
    <>
      <section
        id="testimonials"
        ref={ref}
        style={{
          paddingBlock: 'var(--space-4xl)',
          paddingInline: 'var(--page-gutter)',
          background: 'var(--color-paper)',
        }}
      >
        <div className="hm-rule" style={{ marginBottom: 'var(--space-4xl)' }} />
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ marginBottom: 'var(--space-2xl)' }}
          >
            <span className="hm-chip" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" fill="var(--color-accent)" />
                <line x1="12" y1="2" x2="12" y2="6.8" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="17.2" y1="12" x2="22" y2="12" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="12" y1="17.2" x2="12" y2="22" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="2" y1="12" x2="6.8" y2="12" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {copy.tag}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
              <h2 className="hm-heading">{copy.title}</h2>
              <p className="hm-lead" style={{ maxWidth: '36ch', textAlign: 'right', fontSize: 'var(--text-sm)' }}>
                {copy.subtitle}
              </p>
            </div>
          </motion.div>

          {/* ── Carousel ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            {/* Track wrapper — pause on hover AND focus (WCAG 2.2.2) */}
            <div
              ref={containerRef}
              className="relative overflow-hidden"
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocus={pause}
              onBlur={resume}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label="Carrusel de testimonios"
              aria-roledescription="carousel"
            >
              {showEmpty ? (
                /* Empty state */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <TestimonialCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                /* Cards track */
                <motion.div
                  ref={trackRef}
                  className="flex"
                  style={{ gap: GAP }}
                  animate={prefersReduced ? {} : { x: translateX }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 32,
                    mass: 0.9,
                  }}
                >
                  {showSkeletons
                    ? [0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: cardWidth > 0 ? cardWidth : undefined,
                            minWidth: cardWidth > 0 ? cardWidth : '100%',
                            flexShrink: 0,
                          }}
                        >
                          <TestimonialCardSkeleton />
                        </div>
                      ))
                    : displayList.map((t, i) => (
                        <div
                          key={t.id}
                          style={{
                            width: cardWidth > 0 ? cardWidth : undefined,
                            minWidth: cardWidth > 0 ? cardWidth : '100%',
                            flexShrink: 0,
                          }}
                          aria-roledescription="slide"
                          aria-label={`Testimonio ${i + 1} de ${displayList.length}`}
                        >
                          <TestimonialCard
                            testimonial={t}
                            index={i}
                            onImageClick={setLightboxSrc}
                            onVideoClick={setVideoSrc}
                          />
                        </div>
                      ))
                  }
                </motion.div>
              )}
            </div>

            {/* ── Navigation: dots + arrows ── */}
            {!showEmpty && totalCards > visibleCount && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                {/* Prev */}
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  aria-label={copy.prevLabel}
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-paper-2)',
                    border: '1px solid var(--color-rule)',
                    color: 'var(--color-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === 0 ? 0.3 : 1,
                    transition: 'color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out)',
                  }}
                  onMouseEnter={e => { if (currentIndex !== 0) { (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-muted)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-rule)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                </button>

                {/* Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} role="tablist" aria-label="Posición en el carrusel">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === currentIndex}
                      aria-label={`Ir a la posición ${i + 1}`}
                      onClick={() => goTo(i)}
                      style={{
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--dur-short) var(--ease-out)',
                        background: i === currentIndex ? 'var(--color-accent)' : 'var(--color-rule)',
                        width: i === currentIndex ? 20 : 8,
                        height: 8,
                        padding: 0,
                        minHeight: '44px',
                        display: 'flex',
                        alignSelf: 'center',
                      }}
                    />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={next}
                  disabled={currentIndex === maxIndex}
                  aria-label={copy.nextLabel}
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-paper-2)',
                    border: '1px solid var(--color-rule)',
                    color: 'var(--color-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: currentIndex === maxIndex ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === maxIndex ? 0.3 : 1,
                    transition: 'color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out)',
                  }}
                  onMouseEnter={e => { if (currentIndex !== maxIndex) { (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-muted)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-rule)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>

          {/* ── CTA: leave testimonial ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'center' }}
          >
            <button
              onClick={() => setFormOpen(true)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)' }}
              aria-label="Abrir formulario de testimonio"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {copy.cta}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Modals (rendered outside section to avoid z-index issues) ── */}
      <TestimonialForm isOpen={formOpen} onClose={() => setFormOpen(false)} />

      <AnimatePresence>
        {lightboxSrc && (
          <Lightbox
            key="lightbox"
            src={lightboxSrc}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoSrc && (
          <VideoModal
            key="videomodal"
            src={videoSrc}
            onClose={() => setVideoSrc(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
