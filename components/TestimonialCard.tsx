'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'
import type { Testimonial } from '@/types/testimonial'

// Deterministic accent colour per name (no runtime randomness)
const ACCENT_COLORS = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-rose-600',
]
function nameToColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length]
}

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
  onImageClick: (url: string) => void
  onVideoClick: (url: string) => void
}

export function TestimonialCard({
  testimonial,
  index,
  onImageClick,
  onVideoClick,
}: TestimonialCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const prefersReduced = useReducedMotion()
  const accentBg = nameToColor(testimonial.name)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: prefersReduced ? 0 : index * 0.08,
        duration: prefersReduced ? 0 : 0.5,
        ease: [0.33, 1, 0.68, 1],
      }}
      whileHover={prefersReduced ? undefined : {
        y: -6,
        transition: { type: 'spring', stiffness: 280, damping: 22 },
      }}
      className="
        glass-card rounded-2xl p-6 flex flex-col gap-4 h-full cursor-default
        border border-white/[0.07] hover:border-blue-500/[0.25]
        transition-[border-color,box-shadow] duration-200
        hover:shadow-[0_0_28px_-4px_rgba(59,130,246,0.18)]
      "
    >
      {/* ── Header: avatar + info + verified badge ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {testimonial.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={testimonial.avatar_url}
              alt={testimonial.name}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-white/[0.1]"
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-full flex-shrink-0 ${accentBg} flex items-center justify-center border border-white/[0.1]`}
              aria-hidden="true"
            >
              <span className="text-white text-sm font-bold font-heading">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name + meta */}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-snug truncate">
              {testimonial.name}
            </p>
            {(testimonial.role || testimonial.company) && (
              <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                {[testimonial.role, testimonial.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* Verified badge */}
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/[0.1] border border-amber-400/[0.25] text-amber-400 text-[9px] font-bold tracking-wide whitespace-nowrap">
          <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0L7.5 4.5H12L8.25 7.27L9.75 12L6 9.27L2.25 12L3.75 7.27L0 4.5H4.5L6 0Z" />
          </svg>
          Verificado
        </span>
      </div>

      {/* ── Stars ── */}
      <StarRating
        value={testimonial.rating}
        animateIn={inView}
        stagger
      />

      {/* ── Message ── */}
      <div className="flex-1 relative">
        <span
          className="absolute -top-3 -left-1 text-5xl leading-none font-serif text-blue-500/20 select-none pointer-events-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <p className="text-slate-300 text-sm leading-relaxed pl-4 line-clamp-5">
          {testimonial.message}
        </p>
      </div>

      {/* ── Media buttons ── */}
      {(testimonial.result_image_url || testimonial.video_url) && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          {testimonial.result_image_url && (
            <button
              onClick={() => onImageClick(testimonial.result_image_url!)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.14] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all duration-150 cursor-pointer"
              aria-label="Ver resultado del proyecto"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Ver resultado
            </button>
          )}

          {testimonial.video_url && (
            <button
              onClick={() => onVideoClick(testimonial.video_url!)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/[0.08] hover:bg-blue-500/[0.15] border border-blue-500/[0.2] hover:border-blue-500/[0.35] text-blue-400 hover:text-blue-300 text-[11px] font-medium transition-all duration-150 cursor-pointer"
              aria-label="Ver video del testimonio"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Ver video
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Skeleton card shown while loading ───────────────────────────────────────

export function TestimonialCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-white/[0.06] relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_1.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded-full bg-white/[0.06] overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_1.8s_ease-in-out_infinite] delay-75" />
          </div>
          <div className="h-2.5 w-20 rounded-full bg-white/[0.04] overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_1.8s_ease-in-out_infinite] delay-150" />
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-4 h-4 rounded-sm bg-white/[0.06]" />
        ))}
      </div>

      {/* Message lines */}
      <div className="flex-1 space-y-2.5">
        {[100, 90, 85, 70].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-white/[0.04] overflow-hidden relative"
            style={{ width: `${w}%` }}
          >
            <div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_1.8s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <p className="text-slate-700 text-[11px] text-center pt-2 border-t border-white/[0.04]">
        Sé el primero en compartir tu experiencia
      </p>
    </div>
  )
}
