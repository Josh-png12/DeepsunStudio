import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Agreement, AgreementMember, Profile } from '@/lib/supabase/types'
import { canAccessAdminRoute } from './authorization'

export interface Viewer {
  user: User
  profile: Profile
  memberships: AgreementMember[]
  agreements: Agreement[]
  isAdmin: boolean
}

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileResult, membershipsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('agreement_members').select('*').eq('user_id', user.id),
  ])

  if (!profileResult.data) return null
  const memberships = membershipsResult.data ?? []
  const ids = memberships.map((membership) => membership.agreement_id)
  const agreementsResult = ids.length
    ? await supabase.from('agreements').select('*').in('id', ids).order('start_date', { ascending: false })
    : { data: [] as Agreement[] }

  return {
    user,
    profile: profileResult.data,
    memberships,
    agreements: agreementsResult.data ?? [],
    isAdmin: canAccessAdminRoute(user.id, memberships, profileResult.data.role),
  }
}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) redirect('/portal/login')
  return viewer
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer()
  if (!viewer.isAdmin) redirect('/portal/dashboard?unauthorized=admin')
  return viewer
}

