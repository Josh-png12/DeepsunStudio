'use client'

import {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { supabase } from '@/lib/supabase'
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
    title: 'Lo que dicen mis clientes.',
    subtitle: 'Negocios reales que confiaron en mí para construir su presencia digital.',
    cta: '¿Trabajaste conmigo? Deja tu testimonio →',
    empty: 'Sé el primero en compartir tu experiencia',
    prevLabel: 'Anterior testimonio',
    nextLabel: 'Siguiente testimonio',
  },
  en: {
    tag: 'Testimonials',
    title: 'What my clients say.',
    subtitle: 'Real businesses that trusted me to build their digital presence.',
    cta: 'Did we work together? Leave a testimonial →',
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
      const { data, error } = await supabase
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
      <section id="testimonials" ref={ref} className="relative py-32">
        <div className="section-divider mb-32 -mt-16" />

        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-12"
          >
            <div className="tag-pill mb-6">{copy.tag}</div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2
                className="font-heading font-bold text-white leading-tight tracking-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
              >
                {copy.title}
              </h2>
              <p className="text-slate-500 text-sm sm:text-right max-w-xs sm:max-w-[220px] leading-relaxed">
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
            {/* Track wrapper */}
            <div
              ref={containerRef}
              className="relative overflow-hidden"
              onMouseEnter={pause}
              onMouseLeave={resume}
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
              <div className="flex items-center justify-center gap-4 mt-8">
                {/* Prev arrow */}
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={copy.prevLabel}
                  disabled={currentIndex === 0}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Posición en el carrusel">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === currentIndex}
                      aria-label={`Ir a la posición ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`
                        rounded-full transition-all duration-200
                        ${i === currentIndex
                          ? 'w-5 h-2 bg-blue-500'
                          : 'w-2 h-2 bg-white/[0.2] hover:bg-white/[0.35]'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Next arrow */}
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={copy.nextLabel}
                  disabled={currentIndex === maxIndex}
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
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-10 flex justify-center"
          >
            <MagneticButton
              onClick={() => setFormOpen(true)}
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                bg-white/[0.04] hover:bg-white/[0.08]
                border border-white/[0.1] hover:border-blue-500/[0.35]
                text-slate-300 hover:text-white
                text-sm font-medium
                transition-all duration-200
                shadow-[0_0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_20px_-4px_rgba(59,130,246,0.28)]
                min-h-[44px]
              "
              ariaLabel="Abrir formulario de testimonio"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {copy.cta}
            </MagneticButton>
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
