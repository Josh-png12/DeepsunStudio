'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { LEAD_STATUSES, requirePlatformAdmin } from './intake'
import { optionalText, PortalValidationError, uuid } from './validation'

// Every action re-checks the caller on the server and then relies on RLS + triggers (the database is the final authority).

async function exactlyOne(result: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
  const { data, error } = await result
  if (error) {
    console.error('[portal] intake operation failed:', error.message)
    throw new Error('No se pudo guardar la información. Inténtalo de nuevo.')
  }
  if (!data || data.length !== 1) throw new Error('No se encontró el registro o no tienes permiso para modificarlo.')
}

export async function updateLeadAction(formData: FormData) {
  await requirePlatformAdmin()
  const status = String(formData.get('status') ?? '')
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) throw new PortalValidationError('Estado inválido.')
  const supabase = await createClient()
  await exactlyOne(
    supabase.from('leads').update({ status, admin_notes: optionalText(formData, 'admin_notes', 2000) }).eq('id', uuid(formData, 'lead_id')).select('id'),
  )
  revalidatePath('/portal/admin/solicitudes')
}

export async function deleteLeadAction(formData: FormData) {
  await requirePlatformAdmin()
  const supabase = await createClient()
  await exactlyOne(supabase.from('leads').delete().eq('id', uuid(formData, 'lead_id')).select('id'))
  revalidatePath('/portal/admin/solicitudes')
}

const DECISIONS = {
  approve: { approved: true },
  unapprove: { approved: false, featured: false },
  feature: { featured: true },
  unfeature: { featured: false },
} as const

export async function moderateTestimonialAction(formData: FormData) {
  await requirePlatformAdmin()
  const decision = String(formData.get('decision') ?? '') as keyof typeof DECISIONS
  if (!(decision in DECISIONS)) throw new PortalValidationError('Decisión inválida.')
  const supabase = await createClient()
  await exactlyOne(supabase.from('testimonials').update(DECISIONS[decision]).eq('id', uuid(formData, 'testimonial_id')).select('id'))
  revalidatePath('/portal/admin/testimonios')
}

export async function deleteTestimonialAction(formData: FormData) {
  await requirePlatformAdmin()
  const supabase = await createClient()
  await exactlyOne(supabase.from('testimonials').delete().eq('id', uuid(formData, 'testimonial_id')).select('id'))
  revalidatePath('/portal/admin/testimonios')
}
