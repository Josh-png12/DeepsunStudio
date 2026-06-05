'use client'

/**
 * CursorCard — Linear/Vercel-style cursor spotlight within a card.
 * NOT a cursor follower (banned by Hallmark). This is a radial gradient
 * that illuminates the area under the cursor WITHIN the card boundary.
 * Uses CSS custom properties for zero-JS painting — no React state updates.
 * Desktop-only: skips on coarse-pointer (touch) devices.
 */

import { useRef, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

interface CursorCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  as?: keyof JSX.IntrinsicElements
}

export function CursorCard({ children, className = '', style, as: Tag = 'div' }: CursorCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el || prefersReduced) return
    // Skip on touch/coarse-pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--cx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--cy', `${e.clientY - rect.top}px`)
    el.style.setProperty('--cs', '1')
  }, [prefersReduced])

  const onLeave = useCallback(() => {
    ref.current?.style.setProperty('--cs', '0')
  }, [])

  // Render as the specified element type via JSX
  const El = Tag as 'div'

  return (
    <El
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`hm-cursor-card ${className}`}
      style={style}
      onMouseMove={prefersReduced ? undefined : onMove}
      onMouseLeave={prefersReduced ? undefined : onLeave}
    >
      {children}
    </El>
  )
}
