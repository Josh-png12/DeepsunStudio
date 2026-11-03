'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, requireViewer } from './auth'
import { canManageAgreement } from './authorization'
import {
  boundedInteger,
  isoDate,
  optionalIsoDate,
  optionalText,
  PortalValidationError,
  positiveNumber,
  requiredText,
  safePortalPath,
  signedNumber,
  uuid,
} from './validation'
import { isOpportunityStatus, slugifyProjectName } from './project-tracking'
import type {
  BlockerSeverity,
  DocumentType,
  MilestoneStatus,
  ProjectHealthStatus,
  ProjectStatus,
  ProjectUpdateVisibility,
  TransactionStatus,
  TransactionType,
  UpdateVisibility,
} from '@/lib/supabase/types'

export interface AuthState {
  error?: string
  success?: string
}

function messageFor(error: unknown) {
  if (error instanceof PortalValidationError) return error.message
  return 'No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.'
}

function assertDatabase(result: { error: { message: string } | null }) {
  if (result.error) {
    console.error('[portal] database operation failed:', result.error.message)
    throw new Error('No se pudo guardar la información. Inténtalo de nuevo.')
  }
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const email = requiredText(formData, 'email', 'El correo', 254).toLowerCase()
    const password = requiredText(formData, 'password', 'La contraseña', 200)
    const next = safePortalPath(formData.get('next'))
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'El correo o la contraseña no coinciden.' }
    redirect(next)
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error
    return { error: messageFor(error) }
  }
}

export async function forgotPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const email = requiredText(formData, 'email', 'El correo', 254).toLowerCase()
    const supabase = await createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/portal/auth/callback?next=/portal/reset-password`,
    })
    if (error) throw error
    return { success: 'Si el correo existe, recibirás un enlace para restablecer la contraseña.' }
  } catch (error) {
    return { error: messageFor(error) }
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/portal/login')
}

export async function createAgreementAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const result = await supabase.from('agreements').insert({
    name: requiredText(formData, 'name', 'El nombre', 180),
    status: 'active',
    initial_contribution: positiveNumber(formData, 'initial_contribution', 'El aporte inicial'),
    participation_percentage: positiveNumber(formData, 'participation_percentage', 'La participación'),
    contractual_cap: positiveNumber(formData, 'contractual_cap', 'El límite contractual'),
    start_date: isoDate(formData, 'start_date', 'La fecha de inicio'),
    end_date: optionalText(formData, 'end_date', 10),
    currency: requiredText(formData, 'currency', 'La moneda', 3).toUpperCase(),
    description: optionalText(formData, 'description', 2000),
  })
  assertDatabase(result)
  revalidatePath('/portal')
}

export async function createProjectAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const agreementId = uuid(formData, 'agreement_id')
  if (!viewer.agreements.some((agreement) => agreement.id === agreementId)) throw new PortalValidationError('Acuerdo no autorizado.')
  const name = requiredText(formData, 'name', 'El nombre', 180)
  const estimatedRaw = String(formData.get('estimated_value') ?? '').trim()
  const result = await supabase.from('projects').insert({
    agreement_id: agreementId,
    name,
    public_name: requiredText(formData, 'public_name', 'El nombre visible', 180),
    slug: `${slugifyProjectName(name)}-${crypto.randomUUID().slice(0, 8)}`,
    description: optionalText(formData, 'description', 2000),
    client_name: optionalText(formData, 'client_name', 180),
    client_public_name: optionalText(formData, 'client_public_name', 180),
    service_type: optionalText(formData, 'service_type', 120),
    status: requiredText(formData, 'status', 'El estado', 20) as ProjectStatus,
    health_status: requiredText(formData, 'health_status', 'La salud', 20) as ProjectHealthStatus,
    progress_percent: boundedInteger(formData, 'progress_percent', 'El progreso', 0, 100),
    estimated_value: estimatedRaw ? Number(estimatedRaw) : null,
    started_at: optionalIsoDate(formData, 'actual_start_date', 'La fecha de inicio real'),
    estimated_start_date: optionalIsoDate(formData, 'estimated_start_date', 'La fecha estimada de inicio'),
    estimated_end_date: optionalIsoDate(formData, 'estimated_end_date', 'La fecha estimada de entrega'),
    actual_start_date: optionalIsoDate(formData, 'actual_start_date', 'La fecha de inicio real'),
    completed_at: null,
    investor_visible: formData.get('investor_visible') === 'on',
    current_focus: optionalText(formData, 'current_focus', 600),
    next_step: optionalText(formData, 'next_step', 600),
    created_by: viewer.user.id,
  }).select('id').single()
  assertDatabase(result)
  if (!result.data) throw new Error('No se pudo abrir el proyecto creado.')
  revalidatePath('/portal')
  redirect(`/portal/admin/proyectos/${result.data.id}`)
}

export async function updateProjectAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const projectId = uuid(formData, 'project_id')
  const estimatedRaw = String(formData.get('estimated_value') ?? '').trim()
  const result = await supabase.from('projects').update({
    name: requiredText(formData, 'name', 'El nombre', 180),
    public_name: requiredText(formData, 'public_name', 'El nombre visible', 180),
    description: optionalText(formData, 'description', 2000),
    client_name: optionalText(formData, 'client_name', 180),
    client_public_name: optionalText(formData, 'client_public_name', 180),
    service_type: optionalText(formData, 'service_type', 120),
    estimated_value: estimatedRaw ? Number(estimatedRaw) : null,
    status: requiredText(formData, 'status', 'El estado', 20) as ProjectStatus,
    health_status: requiredText(formData, 'health_status', 'La salud', 20) as ProjectHealthStatus,
    progress_percent: boundedInteger(formData, 'progress_percent', 'El progreso', 0, 100),
    estimated_start_date: optionalIsoDate(formData, 'estimated_start_date', 'La fecha estimada de inicio'),
    estimated_end_date: optionalIsoDate(formData, 'estimated_end_date', 'La fecha estimada de entrega'),
    actual_start_date: optionalIsoDate(formData, 'actual_start_date', 'La fecha de inicio real'),
    completed_at: optionalIsoDate(formData, 'completed_at', 'La fecha de finalización'),
    investor_visible: formData.get('investor_visible') === 'on',
    current_focus: optionalText(formData, 'current_focus', 600),
    next_step: optionalText(formData, 'next_step', 600),
  }).eq('id', projectId).select('agreement_id').single()
  assertDatabase(result)
  if (!result.data) throw new Error('No se encontró el proyecto.')
  const internalNotes = optionalText(formData, 'internal_notes', 5000)
  assertDatabase(await supabase.from('project_internal_details').upsert({
    project_id: projectId,
    agreement_id: result.data.agreement_id,
    internal_notes: internalNotes,
    updated_by: viewer.user.id,
  }))
  revalidatePath('/portal')
}

async function managedProject(projectId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const result = await supabase.from('projects').select('id, agreement_id, status').eq('id', projectId).single()
  assertDatabase(result)
  if (!result.data) throw new Error('No se encontró el proyecto.')
  return { supabase, project: result.data }
}

export async function createProjectUpdateAction(formData: FormData) {
  const viewer = await requireAdmin()
  const projectId = uuid(formData, 'project_id')
  const { supabase, project } = await managedProject(projectId)
  assertDatabase(await supabase.from('project_updates').insert({
    project_id: projectId,
    agreement_id: project.agreement_id,
    title: requiredText(formData, 'title', 'El título', 180),
    summary: requiredText(formData, 'summary', 'El resumen', 600),
    detail: optionalText(formData, 'detail', 5000),
    progress_percent: boundedInteger(formData, 'progress_percent', 'El progreso', 0, 100, true),
    status: (optionalText(formData, 'status', 20) as ProjectStatus | null),
    current_focus: optionalText(formData, 'current_focus', 600),
    next_step: optionalText(formData, 'next_step', 600),
    visibility: requiredText(formData, 'visibility', 'La visibilidad', 20) as ProjectUpdateVisibility,
    is_highlight: formData.get('is_highlight') === 'on',
    created_by: viewer.user.id,
  }))
  revalidatePath('/portal')
}

export async function createMilestoneAction(formData: FormData) {
  const viewer = await requireAdmin()
  const projectId = uuid(formData, 'project_id')
  const { supabase, project } = await managedProject(projectId)
  assertDatabase(await supabase.from('project_milestones').insert({
    project_id: projectId,
    agreement_id: project.agreement_id,
    title: requiredText(formData, 'title', 'El hito', 180),
    description: optionalText(formData, 'description', 2000),
    status: requiredText(formData, 'status', 'El estado', 20) as MilestoneStatus,
    sort_order: boundedInteger(formData, 'sort_order', 'El orden', 0, 9999),
    target_date: optionalIsoDate(formData, 'target_date', 'La fecha objetivo'),
    completed_at: null,
    investor_visible: formData.get('investor_visible') === 'on',
    created_by: viewer.user.id,
  }))
  revalidatePath('/portal')
}

export async function updateMilestoneAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const status = requiredText(formData, 'status', 'El estado', 20) as MilestoneStatus
  const sortOrder = boundedInteger(formData, 'sort_order', 'El orden', 0, 9999, true)
  assertDatabase(await supabase.from('project_milestones').update({
    status,
    ...(sortOrder === null ? {} : { sort_order: sortOrder }),
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }).eq('id', uuid(formData, 'milestone_id')))
  revalidatePath('/portal')
}

export async function createBlockerAction(formData: FormData) {
  const viewer = await requireAdmin()
  const projectId = uuid(formData, 'project_id')
  const { supabase, project } = await managedProject(projectId)
  assertDatabase(await supabase.from('project_blockers').insert({
    project_id: projectId,
    agreement_id: project.agreement_id,
    title: requiredText(formData, 'title', 'El bloqueo', 180),
    description: requiredText(formData, 'description', 'La descripción', 2000),
    severity: requiredText(formData, 'severity', 'La severidad', 20) as BlockerSeverity,
    status: 'open',
    investor_visible: formData.get('investor_visible') === 'on',
    resolved_at: null,
    created_by: viewer.user.id,
  }))
  revalidatePath('/portal')
}

export async function resolveBlockerAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  assertDatabase(await supabase.from('project_blockers').update({
    status: 'resolved',
    resolved_at: new Date().toISOString(),
  }).eq('id', uuid(formData, 'blocker_id')))
  revalidatePath('/portal')
}

export async function createTransactionAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const type = requiredText(formData, 'type', 'El tipo', 20) as TransactionType
  const amount = type === 'adjustment'
    ? signedNumber(formData, 'amount', 'El valor')
    : positiveNumber(formData, 'amount', 'El valor')
  const reason = optionalText(formData, 'reason', 500)
  if (type === 'adjustment' && (!reason || reason.length < 5)) {
    throw new PortalValidationError('El motivo del ajuste es obligatorio.')
  }
  const projectId = optionalText(formData, 'project_id', 36)
  if (projectId) {
    const { data: project } = await supabase.from('projects').select('status').eq('id', projectId).single()
    if (!project || isOpportunityStatus(project.status)) {
      throw new PortalValidationError('Las oportunidades comerciales todavía no pueden generar movimientos financieros.')
    }
  }
  const result = await supabase.from('transactions').insert({
    agreement_id: uuid(formData, 'agreement_id'),
    project_id: projectId,
    type,
    amount,
    currency: requiredText(formData, 'currency', 'La moneda', 3).toUpperCase(),
    effective_date: isoDate(formData, 'effective_date', 'La fecha efectiva'),
    status: requiredText(formData, 'status', 'El estado', 20) as TransactionStatus,
    description: requiredText(formData, 'description', 'El concepto', 500),
    reason,
    support_document_id: null,
    created_by: viewer.user.id,
  })
  assertDatabase(result)
  revalidatePath('/portal')
}

export async function calculateParticipationAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const result = await supabase.rpc('calculate_project_participation', {
    p_project_id: uuid(formData, 'project_id'),
    p_investor_id: uuid(formData, 'investor_id'),
    p_reason: requiredText(formData, 'reason', 'El motivo', 500),
  })
  assertDatabase(result)
  revalidatePath('/portal')
}

export async function approveParticipationAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const result = await supabase.from('participations').update({ status: 'approved' }).eq('id', uuid(formData, 'participation_id')).eq('status', 'calculated')
  assertDatabase(result)
  revalidatePath('/portal')
}

export async function createPaymentAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const participationId = optionalText(formData, 'participation_id', 36)
  const result = await supabase.from('payments').insert({
    agreement_id: uuid(formData, 'agreement_id'),
    investor_id: uuid(formData, 'investor_id'),
    participation_id: participationId,
    amount: positiveNumber(formData, 'amount', 'El valor'),
    payment_date: isoDate(formData, 'payment_date', 'La fecha de pago'),
    payment_method: requiredText(formData, 'payment_method', 'El método', 80),
    reference: optionalText(formData, 'reference', 180),
    document_id: null,
    notes: optionalText(formData, 'notes', 1000),
    created_by: viewer.user.id,
  })
  assertDatabase(result)
  if (participationId) {
    assertDatabase(await supabase.from('participations').update({ status: 'paid' }).eq('id', participationId))
  }
  revalidatePath('/portal')
}

export async function createUpdateAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const result = await supabase.from('updates').insert({
    agreement_id: uuid(formData, 'agreement_id'),
    project_id: optionalText(formData, 'project_id', 36),
    title: requiredText(formData, 'title', 'El título', 180),
    content: requiredText(formData, 'content', 'El contenido', 5000),
    visibility: requiredText(formData, 'visibility', 'La visibilidad', 20) as UpdateVisibility,
    created_by: viewer.user.id,
  })
  assertDatabase(result)
  revalidatePath('/portal')
}

export async function uploadDocumentAction(formData: FormData) {
  const viewer = await requireAdmin()
  const supabase = await createClient()
  const agreementId = uuid(formData, 'agreement_id')
  const type = requiredText(formData, 'type', 'El tipo', 30) as DocumentType
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new PortalValidationError('Selecciona un archivo.')
  if (file.size > 52_428_800) throw new PortalValidationError('El archivo supera el límite de 50 MB.')
  const folderByType: Record<DocumentType, string> = {
    contract: 'contracts', invoice: 'invoices', receipt: 'receipts',
    payment_proof: 'payments', report: 'reports', other: 'other',
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-160)
  const storagePath = `${agreementId}/${folderByType[type]}/${crypto.randomUUID()}-${safeName}`
  const upload = await supabase.storage.from('agreement-documents').upload(storagePath, file, { upsert: false, contentType: file.type })
  if (upload.error) throw new Error('No se pudo subir el archivo privado.')
  const inserted = await supabase.from('documents').insert({
    agreement_id: agreementId,
    project_id: optionalText(formData, 'project_id', 36),
    uploaded_by: viewer.user.id,
    type,
    name: requiredText(formData, 'name', 'El nombre', 240),
    storage_path: storagePath,
    mime_type: file.type || 'application/octet-stream',
    size: file.size,
    investor_visible: formData.get('investor_visible') === 'on',
  })
  if (inserted.error) {
    await supabase.storage.from('agreement-documents').remove([storagePath])
    assertDatabase(inserted)
  }
  revalidatePath('/portal')
}

export async function inviteUserAction(formData: FormData) {
  const viewer = await requireAdmin()
  const email = requiredText(formData, 'email', 'El correo', 254).toLowerCase()
  const fullName = requiredText(formData, 'full_name', 'El nombre', 160)
  const agreementId = uuid(formData, 'agreement_id')
  // The service-role client below bypasses RLS, so authorise here: the caller must MANAGE this agreement, not merely belong to it.
  if (!canManageAgreement(viewer.user.id, agreementId, viewer.memberships, viewer.profile.role)) throw new PortalValidationError('Acuerdo no autorizado.')
  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const invite = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/portal/auth/callback?next=/portal/reset-password`,
    data: { full_name: fullName },
  })
  if (invite.error || !invite.data.user) throw new Error('No se pudo enviar la invitación.')
  assertDatabase(await admin.from('agreement_members').insert({ agreement_id: agreementId, user_id: invite.data.user.id, role: 'investor' }))
  revalidatePath('/portal/admin/usuarios')
}

export async function savePreferencesAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  const checked = (key: string) => formData.get(key) === 'on'
  const result = await supabase.from('user_preferences').upsert({
    user_id: viewer.user.id,
    notify_income: checked('notify_income'),
    notify_participation: checked('notify_participation'),
    notify_payment: checked('notify_payment'),
    notify_document: checked('notify_document'),
    notify_update: checked('notify_update'),
    notification_frequency: requiredText(formData, 'notification_frequency', 'La frecuencia', 20) as 'immediate' | 'daily' | 'weekly',
    locale: 'es-CO',
  })
  assertDatabase(result)
  revalidatePath('/portal/perfil')
}

export async function markPortalSeenAction() {
  const viewer = await requireViewer()
  const supabase = await createClient()
  const result = await supabase.from('user_preferences').update({ last_seen_at: new Date().toISOString() }).eq('user_id', viewer.user.id)
  assertDatabase(result)
}

export async function markNotificationsReadAction() {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', viewer.user.id).is('read_at', null))
  revalidatePath('/portal/novedades')
}

export async function createExpenseAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('personal_expenses').insert({
    user_id: viewer.user.id,
    kind: requiredText(formData, 'kind', 'El tipo', 10) as 'income' | 'expense',
    category: requiredText(formData, 'category', 'La categoría', 80),
    concept: requiredText(formData, 'concept', 'El concepto', 180),
    amount: positiveNumber(formData, 'amount', 'El valor'),
    occurred_on: isoDate(formData, 'occurred_on', 'La fecha'),
  }))
  revalidatePath('/portal/herramientas/gastos')
}

export async function deleteExpenseAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('personal_expenses').delete().eq('id', uuid(formData, 'id')).eq('user_id', viewer.user.id))
  revalidatePath('/portal/herramientas/gastos')
}

export async function createGoalAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('savings_goals').insert({
    user_id: viewer.user.id,
    name: requiredText(formData, 'name', 'El nombre', 120),
    target_amount: positiveNumber(formData, 'target_amount', 'La meta'),
    saved_amount: Number(formData.get('saved_amount') ?? 0),
    target_date: optionalText(formData, 'target_date', 10),
  }))
  revalidatePath('/portal/herramientas/metas')
}

export async function deleteGoalAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('savings_goals').delete().eq('id', uuid(formData, 'id')).eq('user_id', viewer.user.id))
  revalidatePath('/portal/herramientas/metas')
}

export async function createReminderAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('reminders').insert({
    user_id: viewer.user.id,
    title: requiredText(formData, 'title', 'El título', 160),
    due_at: requiredText(formData, 'due_at', 'La fecha', 40),
    status: 'pending',
    note: optionalText(formData, 'note', 1000),
  }))
  revalidatePath('/portal/herramientas/recordatorios')
}

export async function toggleReminderAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('reminders').update({
    status: requiredText(formData, 'status', 'El estado', 20) as 'pending' | 'completed' | 'cancelled',
  }).eq('id', uuid(formData, 'id')).eq('user_id', viewer.user.id))
  revalidatePath('/portal/herramientas/recordatorios')
}

export async function deleteReminderAction(formData: FormData) {
  const viewer = await requireViewer()
  const supabase = await createClient()
  assertDatabase(await supabase.from('reminders').delete().eq('id', uuid(formData, 'id')).eq('user_id', viewer.user.id))
  revalidatePath('/portal/herramientas/recordatorios')
}
