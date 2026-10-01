import { ProjectFinancialSummary, ProjectMilestoneSequence, ProjectProgress, ProjectTimeline, VisibleBlockers } from '@/components/portal/ProjectTrackingUI'
import { EmptyState, PageHeader, SectionTitle, StatusBadge } from '@/components/portal/PortalUI'
import { bytes, formatDate } from '@/lib/portal/format'
import { getProjectDetail } from '@/lib/portal/queries'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { project, transactions, participations, payments, documents, projectUpdates, milestones, blockers, viewer } = await getProjectDetail(id)
  const agreement = viewer.agreements.find((item) => item.id === project.agreement_id)

  return <>
    <PageHeader title={project.public_name} description={project.description || 'Seguimiento ejecutivo del proyecto.'} action={<span className="portal-badge-pair"><StatusBadge value={project.status}/><StatusBadge value={project.health_status}/></span>} />
    <nav className="portal-tabs" aria-label="Secciones del proyecto"><a href="#resumen">Resumen</a><a href="#hitos">Hitos</a><a href="#bitacora">Bitácora</a><a href="#documentos">Documentos</a><a href="#finanzas">Finanzas</a></nav>
    <section id="resumen" className="portal-section portal-detail-grid">
      <div><SectionTitle>Situación actual</SectionTitle><ProjectProgress value={project.progress_percent}/><div className="portal-focus-grid"><article><span>Foco actual</span><strong>{project.current_focus || 'Por definir'}</strong></article><article><span>Próximo paso</span><strong>{project.next_step || 'Por definir'}</strong></article></div><SectionTitle>Bloqueos visibles</SectionTitle><VisibleBlockers blockers={blockers}/></div>
      <aside className="portal-panel"><h2>Ficha de seguimiento</h2><dl className="portal-definition-list"><div><dt>Cliente</dt><dd>{project.client_public_name || 'Reservado'}</dd></div><div><dt>Servicio</dt><dd>{project.service_type || 'No especificado'}</dd></div><div><dt>Inicio estimado</dt><dd>{formatDate(project.estimated_start_date)}</dd></div><div><dt>Entrega estimada</dt><dd>{formatDate(project.estimated_end_date)}</dd></div><div><dt>Inicio real</dt><dd>{formatDate(project.actual_start_date)}</dd></div></dl></aside>
    </section>
    <section id="hitos" className="portal-section"><SectionTitle>Ruta de hitos</SectionTitle><ProjectMilestoneSequence milestones={milestones}/></section>
    <section id="bitacora" className="portal-section"><SectionTitle>Bitácora de avances</SectionTitle><ProjectTimeline updates={projectUpdates}/></section>
    <section id="documentos" className="portal-section"><SectionTitle>Documentos publicados</SectionTitle>{documents.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Tamaño</th><th>Acceso</th></tr></thead><tbody>{documents.map((item) => <tr key={item.id}><td data-label="Nombre">{item.name}</td><td data-label="Tipo">{item.type}</td><td data-label="Fecha">{formatDate(item.created_at)}</td><td data-label="Tamaño">{bytes(item.size)}</td><td data-label="Acceso"><a className="portal-text-link" href={`/portal/documentos/${item.id}/download`}>Abrir</a></td></tr>)}</tbody></table></div> : <EmptyState title="Sin documentos publicados" description="Los soportes visibles para inversionistas aparecerán en esta sección." />}</section>
    <section id="finanzas" className="portal-section"><SectionTitle>Resultado financiero confirmado</SectionTitle><ProjectFinancialSummary project={project} transactions={transactions} participations={participations} payments={payments} percentage={Number(agreement?.participation_percentage ?? 0)}/></section>
  </>
}
