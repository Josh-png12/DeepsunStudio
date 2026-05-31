'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  baseOpacity: number
  opacity: number
  color: 0 | 1
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (shouldReduce) return
    const w = window.innerWidth
    if (w < 768) return

    const count = w >= 1024 ? 60 : 25
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0, rafId = 0, lastTs = 0

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 1,
      baseOpacity: Math.random() * 0.4 + 0.2,
      opacity: 0,
      color: (Math.random() > 0.5 ? 0 : 1) as 0 | 1,
    }))

    const mouse = { x: -9999, y: -9999 }
    let lx = -9999, ly = -9999

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
      } else {
        lastTs = 0
        rafId = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    function draw(ts: number) {
      if (lastTs && ts - lastTs < 16) { rafId = requestAnimationFrame(draw); return }
      lastTs = ts
      ctx.clearRect(0, 0, W, H)

      lx = lerp(lx, mouse.x, 0.05)
      ly = lerp(ly, mouse.y, 0.05)

      for (const p of particles) {
        const dx = p.x - lx, dy = p.y - ly
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = ((120 - dist) / 120) * 0.015
          p.vx += dx * force
          p.vy += dy * force
        }
        p.vx *= 0.985; p.vy *= 0.985
        p.x = (p.x + p.vx + W) % W
        p.y = (p.y + p.vy + H) % H
        p.opacity = Math.min(p.opacity + 0.01, p.baseOpacity)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color === 0
          ? `rgba(59,130,246,${p.opacity})`
          : `rgba(139,92,246,${p.opacity})`
        ctx.fill()
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pa = particles[i], pb = particles[j]
          const dx = pa.x - pb.x, dy = pa.y - pb.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(pa.x, pa.y)
            ctx.lineTo(pb.x, pb.y)
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 100) * 0.15})`
            ctx.lineWidth = 0.15
            ctx.stroke()
          }
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [shouldReduce])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      aria-hidden="true"
    />
  )
}
