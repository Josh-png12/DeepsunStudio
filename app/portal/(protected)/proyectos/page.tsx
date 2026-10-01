import Link from 'next/link'
import { ProjectProgress } from '@/components/portal/ProjectTrackingUI'
import { EmptyState, PageHeader, SectionTitle, StatusBadge } from '@/components/portal/PortalUI'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { latestVisibleUpdate, nextVisibleMilestone, projectPhase } from '@/lib/portal/project-tracking'
import { getAgreementData } from '@/lib/portal/queries'
import type { Project } from '@/lib/supabase/types'

export default async function ProjectsPage() {
  const { projects, projectUpdates, milestones } = await getAgreementData()
  const opportunities = projects.filter((project) => projectPhase(project.status) === 'opportunity')
  const execution = projects.filter((project) => projectPhase(project.status) === 'execution')
  const closed = projects.filter((project) => projectPhase(project.status) === 'closed')

  const renderProject = (project: Project) => {
    const update = latestVisibleUpdate(projectUpdates.filter((item) => item.project_id === project.id))
    const milestone = nextVisibleMilestone(milestones.filter((item) => item.project_id === project.id))
    return <article className="portal-project-card" key={project.id}>
      <div className="portal-project-card-head"><span><StatusBadge value={project.status}/><small>{project.service_type || 'Proyecto'}</small></span><StatusBadge value={project.health_status}/></div>
      <h2><Link href={`/portal/proyectos/${project.id}`}>{project.public_name}</Link></h2>
      <p>{project.description || 'Seguimiento reservado del proyecto.'}</p>
      {projectPhase(project.status) === 'opportunity' && <div className="portal-opportunity-inline"><span>Valor comercial estimado</span><strong>{formatMoney(project.estimated_value)}</strong><small>Esta oportunidad aún no representa un ingreso recibido ni una participación causada.</small></div>}
      <ProjectProgress value={project.progress_percent}/>
      <dl className="portal-card-facts"><div><dt>Foco actual</dt><dd>{project.current_focus || 'Por definir'}</dd></div><div><dt>Próximo hito</dt><dd>{milestone ? `${milestone.title} · ${formatDate(milestone.target_date)}` : 'Sin hito publicado'}</dd></div><div><dt>Último avance</dt><dd>{update ? `${update.title} · ${formatDate(update.created_at)}` : 'Sin actualización'}</dd></div></dl>
      <Link className="portal-text-link" href={`/portal/proyectos/${project.id}`}>Abrir seguimiento →</Link>
    </article>
  }

  if (!projects.length) return <><PageHeader title="Portafolio" description="Seguimiento ejecutivo de oportunidades y proyectos vinculados a tu acuerdo."/><EmptyState title="No hay proyectos visibles" description="Los proyectos aparecerán cuando la administración los publique para inversionistas." /></>

  return <>
    <PageHeader title="Portafolio" description="Oportunidades comerciales y proyectos en ejecución, separados de forma explícita." />
    <section className="portal-section"><SectionTitle>En ejecución</SectionTitle>{execution.length ? <div className="portal-project-cards">{execution.map(renderProject)}</div> : <EmptyState title="Sin proyectos en ejecución" description="Los proyectos contratados aparecerán aquí junto con su avance, hitos y próximos pasos." />}</section>
    <section className="portal-section"><SectionTitle>Oportunidades</SectionTitle><p className="portal-section-intro">Escenarios comerciales informativos. No representan ingresos, utilidad ni participación causada.</p>{opportunities.length ? <div className="portal-project-cards">{opportunities.map(renderProject)}</div> : <EmptyState title="Sin oportunidades publicadas" description="No hay oportunidades comerciales visibles en este momento." />}</section>
    {closed.length > 0 && <section className="portal-section"><SectionTitle>Cerrados</SectionTitle><div className="portal-project-cards">{closed.map(renderProject)}</div></section>}
  </>
}
