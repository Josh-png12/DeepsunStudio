import type {
  AuditLog,
  PortalDocument,
  Payment,
  Participation,
  Project,
  ProjectBlocker,
  ProjectMilestone,
  ProjectStatus,
  ProjectUpdate,
} from '@/lib/supabase/types'

export const OPPORTUNITY_STATUSES: ProjectStatus[] = ['potential', 'proposal', 'negotiation']
export const EXECUTION_STATUSES: ProjectStatus[] = ['contracted', 'active', 'paused', 'completed']

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  potential: 'Potencial',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  contracted: 'Contratado',
  active: 'En ejecución',
  paused: 'En pausa',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export function canCreateProject(role: 'admin' | 'investor') {
  return role === 'admin'
}

export function canReadInternalProjectDetails(role: 'admin' | 'investor') {
  return role === 'admin'
}

export function canManageProjectUpdates(role: 'admin' | 'investor') {
  return role === 'admin'
}

export function visibleUpdatesFor(role: 'admin' | 'investor', updates: ProjectUpdate[]) {
  return role === 'admin' ? updates : updates.filter((item) => item.visibility === 'investor')
}

export function visibleMilestonesFor(role: 'admin' | 'investor', milestones: ProjectMilestone[]) {
  return role === 'admin' ? milestones : milestones.filter((item) => item.investor_visible)
}

export function isOpportunityStatus(status: ProjectStatus) {
  return OPPORTUNITY_STATUSES.includes(status)
}

export function projectAcceptsFinancials(status: ProjectStatus) {
  return EXECUTION_STATUSES.includes(status)
}

export function projectShowsFinancials(status: ProjectStatus) {
  return !isOpportunityStatus(status)
}

export function projectPhase(status: ProjectStatus): 'opportunity' | 'execution' | 'closed' {
  if (isOpportunityStatus(status)) return 'opportunity'
  if (status === 'cancelled') return 'closed'
  return 'execution'
}

export function slugifyProjectName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'proyecto'
}

export function nextVisibleMilestone(milestones: ProjectMilestone[]) {
  return [...milestones]
    .filter((item) => item.investor_visible && !['completed', 'cancelled'].includes(item.status))
    .sort((a, b) => {
      const dateA = a.target_date ?? '9999-12-31'
      const dateB = b.target_date ?? '9999-12-31'
      return dateA.localeCompare(dateB) || a.sort_order - b.sort_order
    })[0] ?? null
}

export function latestVisibleUpdate(updates: ProjectUpdate[]) {
  return [...updates]
    .filter((item) => item.visibility === 'investor')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
}

export function investorProjectProjection(project: Project) {
  return {
    id: project.id,
    agreement_id: project.agreement_id,
    slug: project.slug,
    public_name: project.public_name,
    client_public_name: project.client_public_name,
    service_type: project.service_type,
    description: project.description,
    status: project.status,
    health_status: project.health_status,
    progress_percent: project.progress_percent,
    estimated_start_date: project.estimated_start_date,
    estimated_end_date: project.estimated_end_date,
    actual_start_date: project.actual_start_date,
    completed_at: project.completed_at,
    current_focus: project.current_focus,
    next_step: project.next_step,
    investor_visible: project.investor_visible,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

export interface ActivityItem {
  id: string
  projectId: string | null
  type: 'update' | 'milestone' | 'blocker' | 'document' | 'payment' | 'participation' | 'audit'
  title: string
  description: string
  occurredAt: string
}

export function buildSinceLastVisitActivity(input: {
  lastSeenAt: string | null
  visibleProjectIds: Set<string>
  updates: ProjectUpdate[]
  milestones: ProjectMilestone[]
  blockers: ProjectBlocker[]
  documents: PortalDocument[]
  payments?: Payment[]
  participations?: Participation[]
  auditLogs?: AuditLog[]
}) {
  const after = input.lastSeenAt ? Date.parse(input.lastSeenAt) : 0
  const isNew = (date: string) => Date.parse(date) > after
  const hasProject = (projectId: string | null) => projectId === null || input.visibleProjectIds.has(projectId)

  const activity: ActivityItem[] = [
    ...input.updates
      .filter((item) => item.visibility === 'investor' && input.visibleProjectIds.has(item.project_id) && isNew(item.created_at))
      .map((item) => ({ id: item.id, projectId: item.project_id, type: 'update' as const, title: item.title, description: item.summary, occurredAt: item.created_at })),
    ...input.milestones
      .filter((item) => item.investor_visible && input.visibleProjectIds.has(item.project_id) && isNew(item.updated_at))
      .map((item) => ({ id: item.id, projectId: item.project_id, type: 'milestone' as const, title: item.title, description: item.status === 'completed' ? 'Hito completado' : 'Hito actualizado', occurredAt: item.updated_at })),
    ...input.blockers
      .filter((item) => item.investor_visible && input.visibleProjectIds.has(item.project_id) && isNew(item.updated_at))
      .map((item) => ({ id: item.id, projectId: item.project_id, type: 'blocker' as const, title: item.title, description: item.status === 'resolved' ? 'Bloqueo resuelto' : 'Bloqueo reportado', occurredAt: item.updated_at })),
    ...input.documents
      .filter((item) => item.investor_visible && hasProject(item.project_id) && isNew(item.created_at))
      .map((item) => ({ id: item.id, projectId: item.project_id, type: 'document' as const, title: item.name, description: 'Documento disponible', occurredAt: item.created_at })),
    ...(input.payments ?? [])
      .filter((item) => isNew(item.created_at))
      .map((item) => ({ id: item.id, projectId: null, type: 'payment' as const, title: 'Pago registrado', description: 'Se registró un pago asociado a tu acuerdo.', occurredAt: item.created_at })),
    ...(input.participations ?? [])
      .filter((item) => item.status !== 'adjusted' && isNew(item.created_at))
      .map((item) => ({ id: item.id, projectId: item.project_id, type: 'participation' as const, title: 'Participación causada', description: 'El cálculo contractual fue actualizado.', occurredAt: item.created_at })),
    ...(input.auditLogs ?? [])
      .filter((item) => item.investor_visible && isNew(item.created_at))
      .map((item) => ({ id: item.id, projectId: item.entity_type === 'projects' ? item.entity_id : null, type: 'audit' as const, title: auditActionLabel(item.action), description: item.reason ?? 'Actividad registrada', occurredAt: item.created_at })),
  ]

  return activity.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

export function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    project_created: 'Proyecto creado',
    project_status_changed: 'Estado actualizado',
    project_progress_updated: 'Progreso actualizado',
    project_update_published: 'Nueva actualización',
    milestone_created: 'Hito creado',
    milestone_completed: 'Hito completado',
    blocker_created: 'Bloqueo reportado',
    blocker_resolved: 'Bloqueo resuelto',
    visibility_changed: 'Visibilidad actualizada',
    document_upload: 'Documento publicado',
    payment_created: 'Pago registrado',
  }
  return labels[action] ?? 'Actividad del acuerdo'
}
