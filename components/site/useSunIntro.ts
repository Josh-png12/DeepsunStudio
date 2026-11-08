'use client'

import { useEffect, useLayoutEffect, type RefObject } from 'react'

const KEY = 'ds:sun-intro'
/** Matches the CSS timings in ds-motion.css (desktop / < 640 px). */
const DURATION_MS = 1900
const DURATION_SMALL_MS = 1200

// Layout effect in the browser so a returning visitor never sees a frame without the sun; plain effect on the server.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function seen(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1'
  } catch {
    return false // storage blocked: we cannot remember, so the intro plays
  }
}

function remember() {
  try {
    window.sessionStorage.setItem(KEY, '1')
  } catch {
    /* storage blocked or full: nothing else to do */
  }
}

/**
 * Plays the hero's "del caos a lo claro" intro once per session by switching `data-intro` on `.sun-art`:
 * pending (server markup) → prep (pieces scattered, no transition) → run (assemble) → done (real CSS sun).
 * The attribute is written straight on the node: no state, no re-render.
 */
export function useSunIntro(ref: RefObject<HTMLElement | null>) {
  useIsoLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const set = (v: 'prep' | 'run' | 'done') => node.setAttribute('data-intro', v)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || seen()) {
      set('done')
      return
    }

    let raf1 = 0
    let raf2 = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const total = window.matchMedia('(max-width: 639.98px)').matches ? DURATION_SMALL_MS : DURATION_MS

    set('prep')
    raf1 = requestAnimationFrame(() => {
      // Second frame: the scattered state has been painted, so the transition has a starting point.
      raf2 = requestAnimationFrame(() => {
        set('run')
        timer = setTimeout(() => {
          set('done')
          // Written when the intro completes (not before), so a dev StrictMode remount does not skip it.
          remember()
        }, total)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (timer) clearTimeout(timer)
    }
  }, [ref])
}
