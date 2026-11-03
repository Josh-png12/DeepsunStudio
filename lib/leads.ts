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
}

export type LeadResult = { ok: true } | { ok: false; reason: 'throttled' | 'error' }

const COOLDOWN_MS = 20_000
const KEY = 'ds-lead-ts'

/**
 * Inserts into `leads` (existing table + RLS). Returns ok only after Supabase
 * confirms the insert, so the UI never reports a send that did not happen.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < COOLDOWN_MS) return { ok: false, reason: 'throttled' }
  } catch {}
  try {
    const { error } = await createClient().from('leads').insert(input)
    if (error) throw error
    try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
    return { ok: true }
  } catch (e) {
    console.error('[leads] insert failed', e)
    return { ok: false, reason: 'error' }
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
