/**
 * Hallmark motion system — midnight+amber theme
 * Theme scale: 0.9× (snappy, technical — closest to Midnight)
 * Three primitives: stagger reveal · card hover lift · cursor spotlight
 * All easing values mirror tokens.css --ease-* tokens
 */

export const EASE_OUT   = [0.16, 1, 0.3, 1]  as const
export const EASE_IN    = [0.7,  0, 0.84, 0] as const
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const

// ─── Duration (0.9× midnight scale) ─────────────────────────────────────────

export const DUR = {
  micro:  0.11,   // 110ms — press ticks, checkbox
  short:  0.20,   // 200ms — hover lifts, tooltip
  reveal: 0.45,   // 450ms — scroll-triggered entrance
  long:   0.38,   // 380ms — accordion, modal
} as const

// ─── Stagger ─────────────────────────────────────────────────────────────────

/** Parent variant — triggers staggerChildren on children */
export const staggerContainer = (delayStart = 0.05) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: delayStart,
    },
  },
})

/** Child variant — used inside staggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

/** Reduced-motion version — opacity only, instant */
export const staggerItemReduced = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.01 } },
}

// ─── Section reveal ──────────────────────────────────────────────────────────

/** Standard scroll-triggered reveal for a single element */
export const fadeUp = (inView: boolean, delay = 0, prefersReduced = false) => ({
  initial:    { opacity: 0, y: prefersReduced ? 0 : 16 },
  animate:    inView ? { opacity: 1, y: 0 } : {},
  transition: {
    duration: prefersReduced ? 0.01 : DUR.reveal,
    delay:    prefersReduced ? 0 : delay,
    ease:     EASE_OUT,
  },
})

/** Horizontal reveal — for timeline items */
export const fadeLeft = (inView: boolean, delay = 0, prefersReduced = false) => ({
  initial:    { opacity: 0, x: prefersReduced ? 0 : -16 },
  animate:    inView ? { opacity: 1, x: 0 } : {},
  transition: {
    duration: prefersReduced ? 0.01 : DUR.reveal,
    delay:    prefersReduced ? 0 : delay,
    ease:     EASE_OUT,
  },
})

// ─── Card interactions ────────────────────────────────────────────────────────

/** Hover lift for motion.div cards — no glow, no shadow */
export const cardHover = (prefersReduced: boolean | null) =>
  prefersReduced ? {} : { y: -3 }

export const cardHoverTransition = {
  duration: DUR.short,
  ease: EASE_OUT,
}

export const cardTap = (prefersReduced: boolean | null) =>
  prefersReduced ? {} : { y: 0, scale: 0.99 }

// ─── CTA ─────────────────────────────────────────────────────────────────────

/** Arrow nudge — used on btn-primary/secondary icons */
export const arrowHover = (prefersReduced: boolean | null) =>
  prefersReduced ? {} : { x: 3 }

export const arrowTransition = {
  duration: DUR.short,
  ease: EASE_OUT,
}
