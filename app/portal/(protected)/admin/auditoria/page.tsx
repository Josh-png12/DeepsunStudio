import { getAuditLogs } from '@/lib/portal/queries'
import { formatDateTime } from '@/lib/portal/format'
import { EmptyState, PageHeader } from '@/components/portal/PortalUI'

const actionLabels: Record<string,string> = { insert: 'Creación', update: 'Actualización', delete: 'Eliminación', status_change: 'Cambio de estado', financial_adjustment: 'Ajuste financiero', document_upload: 'Documento agregado', payment_created: 'Pago creado', participation_calculated: 'Participación calculada' }

export default async function AuditPage() {
  const { logs } = await getAuditLogs()
  return <><PageHeader title="Auditoría" description="Historial inmutable de altas, cambios de estado, cálculos, pagos, documentos y ajustes financieros."/>{logs.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Fecha</th><th>Acción</th><th>Entidad</th><th>Motivo</th><th>Actor</th></tr></thead><tbody>{logs.map((item) => <tr key={item.id}><td data-label="Fecha">{formatDateTime(item.created_at)}</td><td data-label="Acción">{actionLabels[item.action] || item.action}</td><td data-label="Entidad">{item.entity_type}</td><td data-label="Motivo">{item.reason || 'Registro automático'}</td><td data-label="Actor" className="portal-number">{item.actor_id ? `${item.actor_id.slice(0,8)}…` : 'Sistema'}</td></tr>)}</tbody></table></div> : <EmptyState title="Sin eventos de auditoría" description="Los eventos aparecerán después de aplicar las migraciones y operar el portal."/>}</>
}

