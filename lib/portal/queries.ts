import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from './auth'
import type {
  AgreementMember,
  AuditLog,
  Payment,
  Participation,
  PersonalExpense,
  PortalDocument,
  PortalUpdate,
  Project,
  ProjectBlocker,
  ProjectInternalDetail,
  ProjectMilestone,
  ProjectUpdate,
  Reminder,
  SavingsGoal,
  Transaction,
  UserPreference,
  Profile,
  Notification,
} from '@/lib/supabase/types'
import { requireAdmin } from './auth'

export async function getAgreementData() {
  const viewer = await requireViewer()
  const agreementIds = viewer.agreements.map((agreement) => agreement.id)
  const supabase = await createClient()

  if (!agreementIds.length) {
    return {
      viewer,
      projects: [] as Project[],
      transactions: [] as Transaction[],
      participations: [] as Participation[],
      payments: [] as Payment[],
      documents: [] as PortalDocument[],
      updates: [] as PortalUpdate[],
      projectUpdates: [] as ProjectUpdate[],
      milestones: [] as ProjectMilestone[],
      blockers: [] as ProjectBlocker[],
      auditLogs: [] as AuditLog[],
      notifications: [] as Notification[],
      preferences: null as UserPreference | null,
    }
  }

  const [projects, transactions, participations, payments, documents, updates, projectUpdates, milestones, blockers, auditLogs, notifications, preferences] = await Promise.all([
    supabase.from('projects').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }),
    supabase.from('transactions').select('*').in('agreement_id', agreementIds).order('effective_date', { ascending: false }),
    supabase.from('participations').select('*').in('agreement_id', agreementIds).order('calculated_at', { ascending: false }),
    supabase.from('payments').select('*').in('agreement_id', agreementIds).order('payment_date', { ascending: false }),
    supabase.from('documents').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }),
    supabase.from('updates').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }),
    supabase.from('project_updates').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }),
    supabase.from('project_milestones').select('*').in('agreement_id', agreementIds).order('sort_order').order('created_at'),
    supabase.from('project_blockers').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }).limit(100),
    supabase.from('notifications').select('*').eq('user_id', viewer.user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('user_preferences').select('*').eq('user_id', viewer.user.id).maybeSingle(),
  ])

  return {
    viewer,
    projects: projects.data ?? [],
    transactions: transactions.data ?? [],
    participations: participations.data ?? [],
    payments: payments.data ?? [],
    documents: documents.data ?? [],
    updates: updates.data ?? [],
    projectUpdates: projectUpdates.data ?? [],
    milestones: milestones.data ?? [],
    blockers: blockers.data ?? [],
    auditLogs: auditLogs.data ?? [],
    notifications: notifications.data ?? [],
    preferences: preferences.data as UserPreference | null,
  }
}

export async function getProjectDetail(id: string) {
  const data = await getAgreementData()
  const project = data.projects.find((item) => item.id === id)
  if (!project) notFound()
  const projectParticipations = data.participations.filter((item) => item.project_id === id)
  const participationIds = new Set(projectParticipations.map((item) => item.id))
  return {
    ...data,
    project,
    transactions: data.transactions.filter((item) => item.project_id === id),
    participations: projectParticipations,
    payments: data.payments.filter((item) => item.participation_id && participationIds.has(item.participation_id)),
    documents: data.documents.filter((item) => item.project_id === id),
    updates: data.updates.filter((item) => item.project_id === id),
    projectUpdates: data.projectUpdates.filter((item) => item.project_id === id),
    milestones: data.milestones.filter((item) => item.project_id === id),
    blockers: data.blockers.filter((item) => item.project_id === id),
  }
}

export async function getAdminProjectDetail(id: string) {
  await requireAdmin()
  const data = await getProjectDetail(id)
  const supabase = await createClient()
  const { data: internalDetail } = await supabase
    .from('project_internal_details')
    .select('*')
    .eq('project_id', id)
    .maybeSingle()
  return { ...data, internalDetail: internalDetail as ProjectInternalDetail | null }
}

export async function getPersonalToolsData() {
  const viewer = await requireViewer()
  const supabase = await createClient()
  const [expenses, goals, reminders] = await Promise.all([
    supabase.from('personal_expenses').select('*').eq('user_id', viewer.user.id).order('occurred_on', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', viewer.user.id).order('created_at', { ascending: false }),
    supabase.from('reminders').select('*').eq('user_id', viewer.user.id).order('due_at'),
  ])
  return {
    viewer,
    expenses: (expenses.data ?? []) as PersonalExpense[],
    goals: (goals.data ?? []) as SavingsGoal[],
    reminders: (reminders.data ?? []) as Reminder[],
  }
}

export async function getPreferences() {
  const viewer = await requireViewer()
  const supabase = await createClient()
  const { data } = await supabase.from('user_preferences').select('*').eq('user_id', viewer.user.id).maybeSingle()
  return { viewer, preferences: data as UserPreference | null }
}

export async function getAuditLogs(): Promise<{ viewer: Awaited<ReturnType<typeof requireViewer>>; logs: AuditLog[] }> {
  const viewer = await requireViewer()
  const agreementIds = viewer.agreements.map((agreement) => agreement.id)
  if (!agreementIds.length) return { viewer, logs: [] }
  const supabase = await createClient()
  const { data } = await supabase.from('audit_logs').select('*').in('agreement_id', agreementIds).order('created_at', { ascending: false }).limit(200)
  return { viewer, logs: data ?? [] }
}

export async function getAdminContext() {
  const viewer = await requireAdmin()
  const agreementIds = viewer.agreements.map((agreement) => agreement.id)
  const supabase = await createClient()
  if (!agreementIds.length) return { viewer, members: [] as AgreementMember[], profiles: [] as Profile[] }
  const membersResult = await supabase.from('agreement_members').select('*').in('agreement_id', agreementIds)
  const members = membersResult.data ?? []
  const userIds = [...new Set(members.map((member) => member.user_id))]
  const profilesResult = userIds.length
    ? await supabase.from('profiles').select('*').in('id', userIds).order('full_name')
    : { data: [] as Profile[] }
  return { viewer, members, profiles: profilesResult.data ?? [] }
}
