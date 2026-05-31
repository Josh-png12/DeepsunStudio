'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  /** When true, animates stars in on mount (for card display) */
  animateIn?: boolean
  /** Whether the stars should enter one by one (requires animateIn + parent inView) */
  stagger?: boolean
}

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
}

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#fbbf24' : 'none'}
      stroke={filled ? '#fbbf24' : '#334155'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  animateIn = false,
  stagger = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const [bouncing, setBouncing] = useState(0)
  const px = SIZES[size]
  const isInteractive = typeof onChange === 'function'
  const display = isInteractive ? (hovered || value) : value

  const handleClick = (star: number) => {
    if (!isInteractive) return
    onChange!(star)
    setBouncing(star)
    setTimeout(() => setBouncing(0), 400)
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role={isInteractive ? 'radiogroup' : undefined}
      aria-label={isInteractive ? 'Calificación' : `${value} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= display
        const isBouncing = bouncing === star

        const starEl = (
          <motion.button
            key={star}
            type="button"
            role={isInteractive ? 'radio' : undefined}
            aria-checked={isInteractive ? star === value : undefined}
            aria-label={isInteractive ? `${star} estrella${star > 1 ? 's' : ''}` : undefined}
            disabled={!isInteractive}
            onClick={() => handleClick(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(0)}
            animate={
              isBouncing
                ? { scale: [1, 1.35, 0.9, 1.12, 1], transition: { duration: 0.38, times: [0, 0.3, 0.55, 0.75, 1] } }
                : { scale: 1 }
            }
            className={`
              block origin-center
              ${isInteractive ? 'cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center' : 'cursor-default'}
              ${!isInteractive ? 'pointer-events-none' : ''}
            `}
            style={{ padding: isInteractive ? undefined : 0 }}
          >
            <StarIcon filled={isFilled} size={px} />
          </motion.button>
        )

        if (animateIn && stagger) {
          return (
            <motion.span
              key={star}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: star * 0.09,
                duration: 0.32,
                ease: [0.33, 1, 0.68, 1],
              }}
            >
              {starEl}
            </motion.span>
          )
        }

        return starEl
      })}
    </div>
  )
}
