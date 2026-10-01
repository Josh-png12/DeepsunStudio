import Link from 'next/link'
import { ProjectProgress } from '@/components/portal/ProjectTrackingUI'
import { PageHeader, StatusBadge } from '@/components/portal/PortalUI'
import { calculateParticipationAction, createProjectAction } from '@/lib/portal/actions'
import { formatDate } from '@/lib/portal/format'
import { projectAcceptsFinancials, PROJECT_STATUS_LABELS } from '@/lib/portal/project-tracking'
import { getAdminContext, getAgreementData } from '@/lib/portal/queries'
import type { Project, ProjectStatus } from '@/lib/supabase/types'

const statuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'all' } = await searchParams
  const [{ viewer, projects, participations, projectUpdates, milestones }, { members, profiles }] = await Promise.all([getAgreementData(), getAdminContext()])
  const profileMap = new Map(profiles.map((item) => [item.id, item.full_name]))
  const investors = members.filter((item) => item.role === 'investor')
  const financialProjects = projects.filter((item) => projectAcceptsFinancials(item.status))
  const matchesFilter = (project: Project) => filter === 'all'
    || (filter === 'opportunities' && ['potential', 'proposal', 'negotiation'].includes(project.status))
    || (filter === 'active' && ['contracted', 'active'].includes(project.status))
    || (filter === 'paused' && project.status === 'paused')
    || (filter === 'closed' && ['completed', 'cancelled'].includes(project.status))
  const filtered = projects.filter(matchesFilter)
  const opportunities = filtered.filter((item) => ['potential', 'proposal', 'negotiation'].includes(item.status))
  const execution = filtered.filter((item) => ['contracted', 'active', 'paused'].includes(item.status))
  const closed = filtered.filter((item) => ['completed', 'cancelled'].includes(item.status))
  const renderProject = (project: Project) => {
    const lastUpdate = projectUpdates.find((item) => item.project_id === project.id)
    const nextMilestone = milestones.find((item) => item.project_id === project.id && !['completed', 'cancelled'].includes(item.status))
    return <article className="portal-project-card" key={project.id}><div className="portal-project-card-head"><StatusBadge value={project.status}/><StatusBadge value={project.health_status}/></div><h2><Link href={`/portal/admin/proyectos/${project.id}`}>{project.name}</Link></h2><p>{project.client_name || 'Cliente reservado'} · {project.current_focus || 'Sin foco operativo registrado.'}</p><ProjectProgress value={project.progress_percent}/><dl className="portal-card-facts"><div><dt>Último avance</dt><dd>{lastUpdate?.title || 'Sin avance'}</dd></div><div><dt>Siguiente hito</dt><dd>{nextMilestone?.title || 'Sin hito'}</dd></div><div><dt>Visible</dt><dd>{project.investor_visible ? 'Sí' : 'No'}</dd></div><div><dt>Actualizado</dt><dd>{formatDate(project.updated_at)}</dd></div><div><dt>Participaciones</dt><dd>{participations.filter((item) => item.project_id === project.id).length}</dd></div></dl><Link className="portal-text-link" href={`/portal/admin/proyectos/${project.id}`}>Administrar seguimiento →</Link></article>
  }

  return <>
    <PageHeader title="Proyectos" description="Crea oportunidades, contrata ejecuciones y controla qué información llega al inversionista." action={<a className="portal-button portal-button-primary" href="#nuevo-proyecto">+ Nuevo proyecto</a>}/>
    <nav className="portal-filter-bar" aria-label="Filtrar proyectos"><Link href="/portal/admin/proyectos">Todos</Link><Link href="?filter=opportunities">Oportunidades</Link><Link href="?filter=active">Activos</Link><Link href="?filter=paused">Pausados</Link><Link href="?filter=closed">Finalizados</Link></nav>
    <div className="portal-admin-grid">
      <div>
        <form id="nuevo-proyecto" action={createProjectAction} className="portal-form portal-admin-form"><h2>Nuevo proyecto</h2>
          <label>Acuerdo<select name="agreement_id" required>{viewer.agreements.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          <div className="portal-form-grid"><label>Nombre interno<input name="name" required/></label><label>Nombre visible<input name="public_name" required/></label><label>Cliente interno<input name="client_name"/></label><label>Cliente visible<input name="client_public_name"/></label><label>Servicio<input name="service_type"/></label><label>Valor estimado<input name="estimated_value" type="number" min="0" step="0.01"/></label><label>Estado<select name="status" defaultValue="potential">{statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Salud<select name="health_status"><option value="on_track">En curso</option><option value="attention">Requiere atención</option><option value="blocked">Bloqueado</option></select></label><label>Progreso<input name="progress_percent" type="number" min="0" max="100" defaultValue="0" required/></label><label>Inicio estimado<input name="estimated_start_date" type="date"/></label><label>Entrega estimada<input name="estimated_end_date" type="date"/></label><label>Inicio real<input name="actual_start_date" type="date"/></label></div>
          <label>Foco actual<input name="current_focus"/></label><label>Próximo paso<input name="next_step"/></label><label>Descripción<textarea name="description"/></label><label className="portal-checkbox"><input name="investor_visible" type="checkbox"/> Visible para inversionista</label><button className="portal-button portal-button-primary" type="submit">Crear y abrir seguimiento</button>
        </form>
        <form action={calculateParticipationAction} className="portal-form portal-admin-form"><h2>Calcular participación</h2><label>Proyecto<select name="project_id" required>{financialProjects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Inversionista<select name="investor_id" required>{investors.map((item) => <option value={item.user_id} key={`${item.agreement_id}-${item.user_id}`}>{profileMap.get(item.user_id) || item.user_id}</option>)}</select></label><label>Motivo<input name="reason" defaultValue="Cálculo basado en movimientos confirmados" required/></label><p className="portal-confirm-copy">Solo aparecen proyectos contratados o en ejecución. PostgreSQL recalcula el ledger y aplica el límite contractual.</p><button className="portal-button portal-button-primary" type="submit" disabled={!financialProjects.length}>Generar participación</button></form>
      </div>
      <div><section className="portal-section"><h2 className="portal-group-label">Oportunidades</h2><div className="portal-project-cards">{opportunities.map(renderProject)}</div></section><section className="portal-section"><h2 className="portal-group-label">Proyectos en ejecución</h2><div className="portal-project-cards">{execution.map(renderProject)}</div></section>{closed.length > 0 && <section className="portal-section"><h2 className="portal-group-label">Finalizados</h2><div className="portal-project-cards">{closed.map(renderProject)}</div></section>}</div>
    </div>
  </>
}
