import Link from 'next/link'
import { ProjectFinancialSummary, ProjectProgress } from '@/components/portal/ProjectTrackingUI'
import { PageHeader, SectionTitle, StatusBadge } from '@/components/portal/PortalUI'
import { createBlockerAction, createMilestoneAction, createProjectUpdateAction, resolveBlockerAction, updateMilestoneAction, updateProjectAction } from '@/lib/portal/actions'
import { bytes, formatDate, formatDateTime } from '@/lib/portal/format'
import { PROJECT_STATUS_LABELS } from '@/lib/portal/project-tracking'
import { getAdminProjectDetail } from '@/lib/portal/queries'
import type { ProjectStatus } from '@/lib/supabase/types'

const statuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getAdminProjectDetail(id)
  const { project, projectUpdates, milestones, blockers, internalDetail, documents, transactions, participations, payments, auditLogs, viewer } = data
  const agreement = viewer.agreements.find((item) => item.id === project.agreement_id)
  const projectAudit = auditLogs.filter((item) => item.entity_id === project.id || (item.new_data && typeof item.new_data === 'object' && !Array.isArray(item.new_data) && item.new_data.project_id === project.id))

  return <>
    <PageHeader title={project.name} description="Ficha operativa, publicación al inversionista y trazabilidad del proyecto." action={<Link className="portal-button portal-button-secondary" href={'/portal/proyectos/' + project.id}>Vista inversionista</Link>}/>
    <nav className="portal-command-actions" aria-label="Acciones del proyecto">
      <a className="portal-button portal-button-secondary" href="#publicar-avance">Registrar avance</a>
      <a className="portal-button portal-button-secondary" href="#hitos">Agregar hito</a>
      <Link className="portal-button portal-button-secondary" href="/portal/admin/movimientos">Registrar movimiento</Link>
      <Link className="portal-button portal-button-secondary" href="/portal/admin/documentos">Subir documento</Link>
      <a className="portal-button portal-button-secondary" href="#riesgos">Registrar bloqueo</a>
      <a className="portal-button portal-button-secondary" href="#ficha">Editar proyecto</a>
    </nav>
    <section className="portal-project-command">
      <div><span><StatusBadge value={project.status}/><StatusBadge value={project.health_status}/><span className="portal-chip">{project.investor_visible ? 'Publicado' : 'Interno'}</span></span><ProjectProgress value={project.progress_percent}/></div>
      <dl><div><dt>Actualizado</dt><dd>{formatDateTime(project.updated_at)}</dd></div><div><dt>Documentos</dt><dd>{documents.length}</dd></div><div><dt>Bloqueos abiertos</dt><dd>{blockers.filter((item) => item.status === 'open').length}</dd></div></dl>
    </section>

    <section id="ficha" className="portal-section"><SectionTitle>Ficha del proyecto</SectionTitle>
      <form action={updateProjectAction} className="portal-form portal-panel">
        <input type="hidden" name="project_id" value={project.id}/>
        <div className="portal-form-grid">
          <label>Nombre interno<input name="name" defaultValue={project.name} required/></label>
          <label>Nombre visible<input name="public_name" defaultValue={project.public_name} required/></label>
          <label>Cliente interno<input name="client_name" defaultValue={project.client_name ?? ''}/></label>
          <label>Cliente visible<input name="client_public_name" defaultValue={project.client_public_name ?? ''}/></label>
          <label>Servicio<input name="service_type" defaultValue={project.service_type ?? ''}/></label>
          <label>Valor comercial estimado<input name="estimated_value" type="number" min="0" step="0.01" defaultValue={project.estimated_value ?? ''}/></label>
          <label>Estado<select name="status" defaultValue={project.status}>{statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Salud<select name="health_status" defaultValue={project.health_status}><option value="on_track">En curso</option><option value="attention">Requiere atención</option><option value="blocked">Bloqueado</option></select></label>
          <label>Progreso<input name="progress_percent" type="number" min="0" max="100" defaultValue={project.progress_percent} required/></label>
          <label>Inicio estimado<input name="estimated_start_date" type="date" defaultValue={project.estimated_start_date ?? ''}/></label>
          <label>Entrega estimada<input name="estimated_end_date" type="date" defaultValue={project.estimated_end_date ?? ''}/></label>
          <label>Inicio real<input name="actual_start_date" type="date" defaultValue={project.actual_start_date ?? ''}/></label>
          <label>Finalización<input name="completed_at" type="date" defaultValue={project.completed_at ?? ''}/></label>
          <label className="portal-span-full">Foco actual<input name="current_focus" defaultValue={project.current_focus ?? ''}/></label>
          <label className="portal-span-full">Próximo paso<input name="next_step" defaultValue={project.next_step ?? ''}/></label>
          <label className="portal-span-full">Descripción pública<textarea name="description" defaultValue={project.description ?? ''}/></label>
          <label className="portal-span-full">Notas internas<textarea name="internal_notes" defaultValue={internalDetail?.internal_notes ?? ''}/></label>
        </div>
        <label className="portal-checkbox"><input name="investor_visible" type="checkbox" defaultChecked={project.investor_visible}/> Visible para inversionista</label>
        <button className="portal-button portal-button-primary" type="submit">Guardar ficha</button>
      </form>
    </section>

    <section id="publicar-avance" className="portal-section portal-editorial-grid">
      <div><SectionTitle>Publicar actualización</SectionTitle><form action={createProjectUpdateAction} className="portal-form portal-admin-form">
        <input type="hidden" name="project_id" value={project.id}/><label>Título<input name="title" required/></label><label>Resumen<textarea name="summary" maxLength={600} required/></label><label>Detalle<textarea name="detail"/></label>
        <div className="portal-form-grid"><label>Progreso nuevo<input name="progress_percent" type="number" min="0" max="100"/></label><label>Estado nuevo<select name="status" defaultValue=""><option value="">Sin cambio</option>{statuses.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
        <label>Foco actual<input name="current_focus"/></label><label>Próximo paso<input name="next_step"/></label><label>Visibilidad<select name="visibility"><option value="investor">Inversionista</option><option value="internal">Solo equipo</option></select></label><label className="portal-checkbox"><input name="is_highlight" type="checkbox"/> Marcar como destacado</label><button className="portal-button portal-button-primary" type="submit">Publicar actualización</button>
      </form></div>
      <div><SectionTitle>Bitácora</SectionTitle><div className="portal-timeline">{projectUpdates.map((item) => <article className="portal-timeline-item" key={item.id}><time>{formatDate(item.created_at)}</time><div><span className="portal-chip">{item.visibility === 'investor' ? 'Inversionista' : 'Interna'}</span><strong>{item.title}</strong><p>{item.summary}</p></div></article>)}</div></div>
    </section>

    <section id="hitos" className="portal-section portal-editorial-grid">
      <div><SectionTitle>Nuevo hito</SectionTitle><form action={createMilestoneAction} className="portal-form portal-admin-form">
        <input type="hidden" name="project_id" value={project.id}/><label>Título<input name="title" required/></label><label>Descripción<textarea name="description"/></label><div className="portal-form-grid"><label>Estado<select name="status"><option value="pending">Pendiente</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueado</option><option value="completed">Completado</option></select></label><label>Orden<input name="sort_order" type="number" min="0" defaultValue={milestones.length} required/></label><label>Fecha objetivo<input name="target_date" type="date"/></label></div><label className="portal-checkbox"><input name="investor_visible" type="checkbox" defaultChecked/> Visible para inversionista</label><button className="portal-button portal-button-secondary" type="submit">Añadir hito</button>
      </form></div>
      <div><SectionTitle>Hitos</SectionTitle><div className="portal-management-list">{milestones.map((item) => <article key={item.id}><div><strong>{item.title}</strong><small>{formatDate(item.target_date)} · {item.investor_visible ? 'visible' : 'interno'}</small></div><form action={updateMilestoneAction}><input type="hidden" name="milestone_id" value={item.id}/><input aria-label="Orden" name="sort_order" type="number" min="0" defaultValue={item.sort_order}/><select aria-label="Estado" name="status" defaultValue={item.status}><option value="pending">Pendiente</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueado</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select><button className="portal-button portal-button-secondary" type="submit">Actualizar</button></form></article>)}</div></div>
    </section>

    <section id="riesgos" className="portal-section portal-editorial-grid">
      <div><SectionTitle>Registrar bloqueo</SectionTitle><form action={createBlockerAction} className="portal-form portal-admin-form"><input type="hidden" name="project_id" value={project.id}/><label>Título<input name="title" required/></label><label>Descripción<textarea name="description" required/></label><label>Severidad<select name="severity"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label><label className="portal-checkbox"><input name="investor_visible" type="checkbox"/> Visible para inversionista</label><button className="portal-button portal-button-secondary" type="submit">Registrar bloqueo</button></form></div>
      <div><SectionTitle>Bloqueos</SectionTitle><div className="portal-management-list">{blockers.map((item) => <article key={item.id}><div><span><StatusBadge value={item.status}/><span className="portal-chip">{item.severity}</span></span><strong>{item.title}</strong><small>{item.description}</small></div>{item.status === 'open' && <form action={resolveBlockerAction}><input type="hidden" name="blocker_id" value={item.id}/><button className="portal-button portal-button-secondary" type="submit">Marcar resuelto</button></form>}</article>)}</div></div>
    </section>

    <section id="finanzas" className="portal-section"><SectionTitle>Finanzas derivadas del ledger</SectionTitle><ProjectFinancialSummary project={project} transactions={transactions} participations={participations} payments={payments} percentage={Number(agreement?.participation_percentage ?? 0)}/></section>
    <section id="documentos" className="portal-section"><SectionTitle>Documentos vinculados</SectionTitle><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Tamaño</th><th>Visibilidad</th></tr></thead><tbody>{documents.map((item) => <tr key={item.id}><td data-label="Nombre">{item.name}</td><td data-label="Tipo">{item.type}</td><td data-label="Tamaño">{bytes(item.size)}</td><td data-label="Visibilidad">{item.investor_visible ? 'Inversionista' : 'Interno'}</td></tr>)}</tbody></table></div></section>
    <section id="auditoria" className="portal-section"><SectionTitle>Auditoría del proyecto</SectionTitle><div className="portal-activity">{projectAudit.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.action}</strong><small>{item.reason || item.entity_type}</small></span><time className="portal-activity-time">{formatDateTime(item.created_at)}</time></article>)}</div></section>
  </>
}
