'use client'

import { useEffect } from 'react'
import { markPortalSeenAction } from '@/lib/portal/actions'

export function LastSeenTracker() {
  useEffect(() => {
    const timer = window.setTimeout(() => { void markPortalSeenAction() }, 1500)
    return () => window.clearTimeout(timer)
  }, [])
  return null
}
