'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorFollower() {
  const mouseX = useMotionValue(-400)
  const mouseY = useMotionValue(-400)
  const [isExpanded, setIsExpanded] = useState(false)

  // Spring stiffness 150, damping 15 — lag suave
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Oculto en dispositivos touch (pointer: coarse)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      setIsExpanded(!!target.closest('a, button, [role="button"], [tabindex]'))
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('pointerover', onPointerOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerover', onPointerOver)
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-0 hidden md:block"
      aria-hidden="true"
      animate={{ scale: isExpanded ? 1.55 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
        willChange: 'transform',
      }}
    />
  )
}
