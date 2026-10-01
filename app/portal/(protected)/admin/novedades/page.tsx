import { createUpdateAction } from '@/lib/portal/actions'
import { getAgreementData } from '@/lib/portal/queries'
import { formatDateTime } from '@/lib/portal/format'
import { PageHeader } from '@/components/portal/PortalUI'

export default async function AdminUpdatesPage() {
  const { viewer, projects, updates } = await getAgreementData()
  return <><PageHeader title="Novedades" description="Publica información cronológica para miembros o notas visibles solo por administración."/><div className="portal-admin-grid"><form action={createUpdateAction} className="portal-form portal-admin-form"><h2>Publicar novedad</h2><label>Acuerdo<select name="agreement_id">{viewer.agreements.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Proyecto<select name="project_id"><option value="">General</option>{projects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Título<input name="title" required/></label><label>Contenido<textarea name="content" required/></label><label>Visibilidad<select name="visibility"><option value="members">Miembros</option><option value="admin_only">Solo administración</option></select></label><button className="portal-button portal-button-primary" type="submit">Publicar novedad</button></form><div className="portal-activity">{updates.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{item.content} · {item.visibility === 'members' ? 'Miembros' : 'Solo administración'}</small></span><time className="portal-activity-time">{formatDateTime(item.created_at)}</time></article>)}</div></div></>
}

