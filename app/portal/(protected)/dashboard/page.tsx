import Link from 'next/link'
import { LastSeenTracker } from '@/components/portal/LastSeenTracker'
import { CompactProjectList } from '@/components/portal/ProjectTrackingUI'
import { EmptyState, SectionTitle } from '@/components/portal/PortalUI'
import { formatDate, formatDateTime, formatMoney } from '@/lib/portal/format'
import { buildSinceLastVisitActivity, EXECUTION_STATUSES } from '@/lib/portal/project-tracking'
import { getAgreementData } from '@/lib/portal/queries'

export default async function DashboardPage() {
  const data = await getAgreementData()
  const { viewer, projects, participations, payments, documents, projectUpdates, milestones, blockers, auditLogs, preferences } = data
  const agreement = viewer.agreements[0]
  if (!agreement) return <EmptyState title="Aún no tienes un acuerdo vinculado" description="La administración debe añadir tu cuenta como miembro antes de que aparezca información contractual." />

  const accumulated = participations.filter((item) => item.status !== 'adjusted').reduce((sum, item) => sum + Number(item.amount), 0)
  const paid = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const pending = Math.max(accumulated - paid, 0)
  const progress = agreement.contractual_cap > 0 ? Math.min(accumulated / Number(agreement.contractual_cap) * 100, 100) : 0
  const visibleIds = new Set(projects.map((project) => project.id))
  const sinceLastVisit = buildSinceLastVisitActivity({ lastSeenAt: preferences?.last_seen_at ?? null, visibleProjectIds: visibleIds, updates: projectUpdates, milestones, blockers, documents, payments, participations, auditLogs }).slice(0, 10)
  const hour = Number(new Intl.DateTimeFormat('es-CO', { hour: '2-digit', hour12: false, timeZone: 'America/Bogota' }).format(new Date()))
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return <>
    <LastSeenTracker />
    <section className="portal-summary">
      <div><p className="portal-summary-kicker">Seguimiento privado</p><h1>{greeting}, {viewer.profile.full_name.split(' ')[0]}.</h1><p className="portal-summary-copy">{agreement.name} · vinculado desde {formatDate(agreement.start_date)}</p></div>
      <div className="portal-participation-figure"><span>Participaciones acumuladas</span><strong>{formatMoney(accumulated)}</strong><div className="portal-progress" aria-label={`${progress.toFixed(0)} por ciento del límite contractual`}><span style={{ transform: `scaleX(${progress / 100})` }} /></div><div className="portal-progress-copy"><span>Acumulado</span><span>{formatMoney(agreement.contractual_cap)}</span></div><p className="portal-disclaimer">El límite máximo contractual no constituye rentabilidad garantizada.</p></div>
    </section>
    <section className="portal-metrics" aria-label="Resumen contractual">
      <div className="portal-metric"><span>Pagado</span><strong>{formatMoney(paid)}</strong></div><div className="portal-metric"><span>Pendiente</span><strong>{formatMoney(pending)}</strong></div><div className="portal-metric"><span>En ejecución</span><strong>{projects.filter((project) => EXECUTION_STATUSES.includes(project.status) && project.status !== 'completed').length}</strong></div><div className="portal-metric"><span>Novedades desde tu visita</span><strong>{sinceLastVisit.length}</strong></div>
    </section>
    {projects.length ? <CompactProjectList projects={projects} /> : <EmptyState title="No hay proyectos visibles" description="El portafolio aparecerá cuando el equipo publique el primer proyecto." />}
    <section className="portal-section"><SectionTitle action={<Link className="portal-text-link" href="/portal/novedades">Historial general</Link>}>Desde tu última visita</SectionTitle>{sinceLastVisit.length ? <div className="portal-activity">{sinceLastVisit.map((item) => <div className="portal-activity-item" key={`${item.type}-${item.id}`}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{item.description}</small></span><time className="portal-activity-time">{formatDateTime(item.occurredAt)}</time></div>)}</div> : <EmptyState title="Estás al día" description="No hay hitos, avances, documentos ni cambios visibles desde tu última visita." />}</section>
  </>
}
