'use client'

import { createClient } from '@/lib/supabase/client'

export interface LeadInput {
  business_type: string
  needs: string[]
  budget: string
  timeline: string
  name: string
  email: string
  whatsapp: string | null
  message: string | null
  /** Which form produced the lead; stored so an admin can tell the full brief from the quick home form. */
  source: 'brief' | 'home_quick'
}

export type LeadResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; reason: 'throttled' | 'rate_limited' | 'paused' | 'invalid' | 'error' }

const COOLDOWN_MS = 20_000
const KEY = 'ds-lead-ts'

/** Maps the SQLSTATEs raised by the database guards (supabase/migrations/202611030001_public_intake.sql). */
export function classifyIntakeError(error: { code?: string } | null | undefined): LeadResult | null {
  if (!error) return null
  if (error.code === 'DS001') return { ok: true, duplicate: true } // an identical request was already stored
  if (error.code === 'DS002') return { ok: false, reason: 'rate_limited' }
  if (error.code === 'DS003') return { ok: false, reason: 'paused' }
  if (error.code === '23514' || error.code === '22001' || error.code === '23502') return { ok: false, reason: 'invalid' }
  return { ok: false, reason: 'error' }
}

/**
 * Inserts into `leads` (RLS + server-side guards). Returns ok only after the database confirms the insert (or confirms an identical
 * request is already stored), so the UI never reports a send that did not happen. The 20 s browser cool-down is a convenience only;
 * real abuse protection lives in the database.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < COOLDOWN_MS) return { ok: false, reason: 'throttled' }
  } catch {}
  try {
    const { error } = await createClient().from('leads').insert(input)
    const classified = classifyIntakeError(error)
    if (classified) {
      if (classified.ok) {
        try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
      } else console.error('[leads] insert rejected', error)
      return classified
    }
    try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
    return { ok: true }
  } catch (e) {
    console.error('[leads] insert failed', e)
    return { ok: false, reason: 'error' }
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
