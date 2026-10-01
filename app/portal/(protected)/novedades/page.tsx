import { EmptyState, PageHeader, SectionTitle } from '@/components/portal/PortalUI'
import { markNotificationsReadAction } from '@/lib/portal/actions'
import { formatDateTime } from '@/lib/portal/format'
import { getAgreementData } from '@/lib/portal/queries'

export default async function UpdatesPage() {
  const { updates, projectUpdates, notifications, projects } = await getAgreementData()
  const names = new Map(projects.map((project) => [project.id, project.public_name]))
  const activity = [
    ...updates.map((item) => ({ id: `general-${item.id}`, at: item.created_at, title: item.title, detail: item.content, unread: false })),
    ...projectUpdates.map((item) => ({ id: `project-${item.id}`, at: item.created_at, title: item.title, detail: `${item.summary} · ${names.get(item.project_id) ?? 'Proyecto'}`, unread: false })),
    ...notifications.filter((item) => !['project_update', 'update'].includes(item.type)).map((item) => ({ id: `notification-${item.id}`, at: item.created_at, title: item.title, detail: item.message, unread: !item.read_at })),
  ].sort((a, b) => b.at.localeCompare(a.at))
  const unread = notifications.filter((item) => !item.read_at).length

  return <><PageHeader title="Novedades" description="Avances, hitos, documentos y comunicaciones visibles de tus acuerdos." action={unread ? <form action={markNotificationsReadAction}><button className="portal-button portal-button-secondary" type="submit">Marcar {unread} como leídas</button></form> : undefined}/><section className="portal-section"><SectionTitle>Actividad publicada</SectionTitle>{activity.length ? <div className="portal-activity">{activity.map((item) => <article className="portal-activity-item" key={item.id} data-unread={item.unread || undefined}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{item.detail}</small></span><time className="portal-activity-time">{formatDateTime(item.at)}</time></article>)}</div> : <EmptyState title="Sin novedades" description="Los avances y documentos publicados para tus acuerdos aparecerán aquí." />}</section></>
}
