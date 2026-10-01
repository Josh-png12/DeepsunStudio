import { createReminderAction, deleteReminderAction, toggleReminderAction } from '@/lib/portal/actions'
import { getPersonalToolsData } from '@/lib/portal/queries'
import { formatDateTime } from '@/lib/portal/format'
import { PageHeader, StatusBadge, ToolsNotice } from '@/components/portal/PortalUI'

export default async function RemindersPage() {
  const { reminders } = await getPersonalToolsData()
  return <><PageHeader title="Recordatorios" description="Fechas y notas personales, separadas del acuerdo contractual."/><ToolsNotice/><div className="portal-admin-grid"><form action={createReminderAction} className="portal-form portal-admin-form"><h2>Nuevo recordatorio</h2><label>Título<input name="title" required/></label><label>Fecha y hora<input name="due_at" type="datetime-local" required/></label><label>Nota<textarea name="note"/></label><button className="portal-button portal-button-primary" type="submit">Crear recordatorio</button></form><div className="portal-project-list">{reminders.map((item) => <article className="portal-panel" key={item.id}><StatusBadge value={item.status}/><h2>{item.title}</h2><p>{item.note || 'Sin nota adicional.'}</p><p className="portal-number">{formatDateTime(item.due_at)}</p><div className="portal-form-actions"><form action={toggleReminderAction}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value={item.status === 'completed' ? 'pending' : 'completed'}/><button className="portal-button portal-button-secondary" type="submit">{item.status === 'completed' ? 'Reabrir' : 'Completar'}</button></form><form action={deleteReminderAction}><input type="hidden" name="id" value={item.id}/><button className="portal-text-link" type="submit">Eliminar</button></form></div></article>)}</div></div></>
}

