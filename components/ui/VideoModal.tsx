'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoModalProps {
  src: string
  onClose: () => void
}

export function VideoModal({ src, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        key="video-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/88 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Video del cliente"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] flex items-center justify-center text-slate-300 hover:text-white transition-all z-10"
          aria-label="Cerrar video"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>

        {/* Video container */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[95vw] sm:w-[80vw] lg:w-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/[0.08]"
        >
          <video
            ref={videoRef}
            src={src}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[80vh] object-contain"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
