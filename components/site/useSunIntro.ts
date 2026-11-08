'use client'

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { SUN_INTRO_KEY } from '@/lib/sun-intro'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The intro itself is pure CSS (ds-motion.css) and starts with the first paint: it never waits for JavaScript.
 * This hook only remembers that it played, and skips it (before paint) when the home is mounted again by
 * client-side navigation in the same session.
 */
export function useSunIntro(ref: RefObject<HTMLElement | null>) {
  const decided = useRef(false) // StrictMode re-runs effects on the same instance: decide only once
  useIsoLayoutEffect(() => {
    const node = ref.current
    if (!node || decided.current) return
    decided.current = true
    if (document.documentElement.getAttribute('data-sun-intro') === 'skip') return
    try {
      if (window.sessionStorage.getItem(SUN_INTRO_KEY)) node.setAttribute('data-intro', 'skip')
      else window.sessionStorage.setItem(SUN_INTRO_KEY, '1')
    } catch {
      /* storage blocked: the intro simply plays */
    }
  }, [ref])
}
