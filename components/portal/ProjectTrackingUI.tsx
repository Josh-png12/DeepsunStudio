import Link from 'next/link'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { nextVisibleMilestone, projectShowsFinancials } from '@/lib/portal/project-tracking'
import type { Project, ProjectBlocker, ProjectMilestone, ProjectUpdate, Transaction, Participation, Payment } from '@/lib/supabase/types'
import { calculateFinancialBreakdown } from '@/lib/portal/finance'
import { EmptyState, SectionTitle, StatusBadge } from './PortalUI'

export function ProjectProgress({ value }: { value: number }) {
  const progress = Math.max(0, Math.min(100, value))
  return <div className="portal-project-progress"><div className="portal-progress-copy"><span>Avance general</span><strong>{progress}%</strong></div><div className="portal-progress"><span style={{ transform: `scaleX(${progress / 100})` }} /></div></div>
}

export function OpportunityNotice({ estimatedValue }: { estimatedValue?: number | null }) {
  return <div className="portal-opportunity-note"><strong>Oportunidad comercial</strong>{estimatedValue != null && <p>Valor comercial estimado: <span className="portal-number">{formatMoney(estimatedValue)}</span></p>}<p>Esta oportunidad aún no representa un ingreso recibido ni una participación causada.</p></div>
}

export function ProjectMilestoneSequence({ milestones }: { milestones: ProjectMilestone[] }) {
  if (!milestones.length) return <EmptyState title="Sin hitos publicados" description="Los hitos aparecerán a medida que se defina y ejecute el plan de trabajo." />
  const next = nextVisibleMilestone(milestones)
  return <ol className="portal-step-sequence">{milestones.map((item, index) => <li key={item.id} data-state={item.status}><span className="portal-step-index">{String(index + 1).padStart(2, '0')}</span><div><div className="portal-step-heading"><strong>{item.title}</strong><StatusBadge value={item.status}/></div>{item.description && <p>{item.description}</p>}<small>{item.id === next?.id ? 'Próximo hito' : item.status === 'completed' ? `Completado ${formatDate(item.completed_at)}` : `Objetivo ${formatDate(item.target_date)}`}</small></div></li>)}</ol>
}

export function ProjectTimeline({ updates }: { updates: ProjectUpdate[] }) {
  if (!updates.length) return <EmptyState title="Sin actualizaciones" description="La bitácora mostrará avances publicados por el equipo." />
  return <div className="portal-timeline">{updates.map((item) => <article key={item.id} className="portal-timeline-item"><time>{formatDate(item.created_at)}</time><div><div className="portal-timeline-heading"><strong>{item.title}</strong>{item.is_highlight && <span className="portal-chip">Destacado</span>}</div><p>{item.summary}</p>{item.detail && <details><summary>Ver detalle</summary><p>{item.detail}</p></details>}</div></article>)}</div>
}

export function VisibleBlockers({ blockers }: { blockers: ProjectBlocker[] }) {
  const open = blockers.filter((item) => item.status === 'open')
  if (!open.length) return <p className="portal-clear-state">Sin bloqueos visibles en este momento.</p>
  return <div className="portal-blocker-list">{open.map((item) => <article key={item.id}><div><StatusBadge value={item.status}/><span className="portal-chip">Severidad {item.severity}</span></div><strong>{item.title}</strong><p>{item.description}</p></article>)}</div>
}

export function ProjectFinancialSummary({ project, transactions, participations, payments, percentage }: { project: Project; transactions: Transaction[]; participations: Participation[]; payments: Payment[]; percentage: number }) {
  if (!projectShowsFinancials(project.status)) return <OpportunityNotice estimatedValue={project.estimated_value} />
  const finance = calculateFinancialBreakdown(transactions.map((item) => ({ type: item.type, amount: Number(item.amount), status: item.status })))
  const participation = participations.filter((item) => item.status !== 'adjusted').reduce((sum, item) => sum + Number(item.amount), 0)
  const paid = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  return <div className="portal-ledger"><div className="portal-ledger-row"><span>Ingresos efectivamente recibidos</span><strong>{formatMoney(finance.grossIncome)}</strong></div><div className="portal-ledger-row"><span>Costos directos confirmados</span><strong>− {formatMoney(finance.directCosts)}</strong></div><div className="portal-ledger-row"><span>Devoluciones y reversos</span><strong>− {formatMoney(finance.refunds + finance.chargebacks)}</strong></div><div className="portal-ledger-row portal-ledger-total"><span>Ganancia neta determinada</span><strong>{formatMoney(finance.netProfit)}</strong></div><div className="portal-ledger-row"><span>Participación contractual</span><strong>{percentage}%</strong></div><div className="portal-ledger-row"><span>Participación causada</span><strong>{formatMoney(participation)}</strong></div><div className="portal-ledger-row"><span>Participación pagada</span><strong>{formatMoney(paid)}</strong></div><div className="portal-ledger-row portal-ledger-total"><span>Pendiente</span><strong>{formatMoney(Math.max(participation - paid, 0))}</strong></div><p className="portal-disclaimer">Solo los ingresos efectivamente recibidos y los costos confirmados intervienen en estos cálculos.</p></div>
}

export function CompactProjectList({ projects }: { projects: Project[] }) {
  return <section className="portal-section"><SectionTitle action={<Link className="portal-text-link" href="/portal/proyectos">Ver portafolio</Link>}>En qué estamos trabajando</SectionTitle><div className="portal-portfolio-strip">{projects.slice(0, 5).map((project) => <Link href={`/portal/proyectos/${project.id}`} key={project.id}><span><StatusBadge value={project.status}/><small>{project.service_type || 'Proyecto'}</small></span><span className="portal-portfolio-detail"><strong>{project.public_name}</strong><small>Actualmente: {project.current_focus || 'Por definir'}</small><small>Siguiente: {project.next_step || 'Por definir'} · actualizado {formatDate(project.updated_at)}</small></span><ProjectProgress value={project.progress_percent}/></Link>)}</div></section>
}
