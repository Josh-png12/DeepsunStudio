import Link from 'next/link'
import { PageHeader, SectionTitle, StatusBadge } from '@/components/portal/PortalUI'
import { formatDate, formatDateTime, formatMoney } from '@/lib/portal/format'
import { calculateFinancialBreakdown } from '@/lib/portal/finance'
import { projectPhase } from '@/lib/portal/project-tracking'
import { getAgreementData } from '@/lib/portal/queries'

export default async function AdminDashboardPage() {
  const { viewer, projects, transactions, participations, payments, documents, projectUpdates, milestones, blockers } = await getAgreementData()
  const finance = calculateFinancialBreakdown(transactions.map((item) => ({ type: item.type, amount: Number(item.amount), status: item.status })))
  const caused = participations.filter((item) => item.status !== 'adjusted').reduce((sum, item) => sum + Number(item.amount), 0)
  const paid = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const execution = projects.filter((item) => projectPhase(item.status) === 'execution' && item.status !== 'completed')
  const opportunities = projects.filter((item) => projectPhase(item.status) === 'opportunity')
  const openBlockers = blockers.filter((item) => item.status === 'open')
  const upcoming = milestones.filter((item) => !['completed', 'cancelled'].includes(item.status)).sort((a, b) => (a.target_date ?? '9999').localeCompare(b.target_date ?? '9999')).slice(0, 6)
  const projectNames = new Map(projects.map((item) => [item.id, item.name]))
  const activity = projectUpdates.slice(0, 8)

  return <>
    <PageHeader title="Centro de seguimiento" description="Panorama operativo, editorial y financiero del portafolio privado." action={<div className="portal-form-actions"><Link className="portal-button portal-button-primary" href="/portal/admin/proyectos#nuevo-proyecto">+ Nuevo proyecto</Link><Link className="portal-button portal-button-secondary" href="/portal/admin/movimientos">Registrar movimiento</Link></div>}/>
    <section className="portal-metrics"><div className="portal-metric"><span>Acuerdos activos</span><strong>{viewer.agreements.filter((item) => item.status === 'active').length}</strong></div><div className="portal-metric"><span>Proyectos activos</span><strong>{execution.length}</strong></div><div className="portal-metric"><span>Oportunidades</span><strong>{opportunities.length}</strong></div><div className="portal-metric"><span>Bloqueos abiertos</span><strong>{openBlockers.length}</strong></div></section>
    <section className="portal-dashboard-grid portal-section">
      <div><SectionTitle>Proyectos que requieren lectura</SectionTitle><div className="portal-activity">{execution.map((project) => <Link href={`/portal/admin/proyectos/${project.id}`} className="portal-activity-item" key={project.id}><span className="portal-activity-mark"/><span><strong>{project.name}</strong><small>{project.current_focus || 'Sin foco operativo registrado'}</small></span><StatusBadge value={project.health_status}/></Link>)}</div></div>
      <aside className="portal-panel"><h2>Próximos hitos</h2><div className="portal-hanging-list">{upcoming.map((item) => <div key={item.id}><time>{formatDate(item.target_date)}</time><span><strong>{item.title}</strong><small>{projectNames.get(item.project_id)}</small></span></div>)}</div></aside>
    </section>
    <section className="portal-section"><SectionTitle action={<Link className="portal-text-link" href="/portal/admin/proyectos?filter=opportunities">Ver oportunidades</Link>}>Oportunidades</SectionTitle><div className="portal-project-cards">{opportunities.slice(0, 4).map((project) => <Link className="portal-project-card" href={`/portal/admin/proyectos/${project.id}`} key={project.id}><StatusBadge value={project.status}/><strong>{project.name}</strong><span className="portal-number">Valor comercial estimado {formatMoney(project.estimated_value)}</span><small>No corresponde a ingreso recibido.</small></Link>)}</div></section>
    <section className="portal-metrics"><div className="portal-metric"><span>Ingresos confirmados</span><strong>{formatMoney(finance.grossIncome)}</strong></div><div className="portal-metric"><span>Costos directos</span><strong>{formatMoney(finance.directCosts)}</strong></div><div className="portal-metric"><span>Participaciones causadas</span><strong>{formatMoney(caused)}</strong></div><div className="portal-metric"><span>Participaciones pagadas</span><strong>{formatMoney(paid)}</strong></div><div className="portal-metric"><span>Pendiente por pagar</span><strong>{formatMoney(Math.max(caused - paid, 0))}</strong></div></section>
    <section className="portal-section"><SectionTitle>Últimas publicaciones</SectionTitle><div className="portal-activity">{activity.map((item) => <Link href={`/portal/admin/proyectos/${item.project_id}`} className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{projectNames.get(item.project_id)} · {item.visibility === 'investor' ? 'Visible para inversionista' : 'Interna'}</small></span><time className="portal-activity-time">{formatDateTime(item.created_at)}</time></Link>)}</div><p className="portal-disclaimer">{documents.length} documentos registrados en el repositorio privado.</p></section>
  </>
}
