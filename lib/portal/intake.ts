import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PublicLead, PublicTestimonial } from '@/lib/supabase/types'
import { requireViewer, type Viewer } from './auth'

/**
 * Leads and testimonials are readable only by PLATFORM admins (RLS: is_platform_admin()). An agreement-level admin passes
 * requireAdmin() for the rest of /portal/admin but would see empty lists here, so this guard is stricter and says so up front.
 */
export async function requirePlatformAdmin(): Promise<Viewer> {
  const viewer = await requireViewer()
  if (viewer.profile.role !== 'admin') redirect('/portal/dashboard?unauthorized=admin')
  return viewer
}

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export type AdminLead = PublicLead & { source: string; status: LeadStatus; admin_notes: string | null; handled_at: string | null }
export type AdminTestimonial = PublicTestimonial

const LEAD_COLUMNS = 'id,created_at,business_type,needs,budget,timeline,name,email,whatsapp,message,source,status,admin_notes,handled_at'
const TESTIMONIAL_COLUMNS = 'id,created_at,name,company,role,message,rating,avatar_url,result_image_url,video_url,approved,featured'

export async function getLeads(): Promise<{ leads: AdminLead[]; error: boolean }> {
  await requirePlatformAdmin()
  const { data, error } = await (await createClient()).from('leads').select(LEAD_COLUMNS).order('created_at', { ascending: false }).limit(500)
  if (error) console.error('[portal] leads query failed:', error.message)
  return { leads: (data ?? []) as AdminLead[], error: !!error }
}

export async function getTestimonialsForModeration(): Promise<{ testimonials: AdminTestimonial[]; error: boolean }> {
  await requirePlatformAdmin()
  const { data, error } = await (await createClient())
    .from('testimonials')
    .select(TESTIMONIAL_COLUMNS)
    .order('approved', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) console.error('[portal] testimonials query failed:', error.message)
  return { testimonials: (data ?? []) as AdminTestimonial[], error: !!error }
}
