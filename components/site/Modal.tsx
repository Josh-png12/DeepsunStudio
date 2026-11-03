'use client'

import { useEffect, useRef } from 'react'
import { useSite } from '@/lib/site-i18n'

/** Accessible dialog: Escape + backdrop close, focus moves in, Tab is trapped, focus returns on close, page scroll locked. */
export default function Modal({ onClose, labelledBy, children, wide = false }: { onClose: () => void; labelledBy: string; children: React.ReactNode; wide?: boolean }) {
  const { lang } = useSite()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? []).filter((el) => !el.hasAttribute('disabled'))
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prev?.focus()
    }
  }, [onClose])

  return (
    <div className="modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal-panel${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={panel}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={lang === 'es' ? 'Cerrar' : 'Close'}>✕</button>
        {children}
      </div>
    </div>
  )
}
