import { getAgreementData } from '@/lib/portal/queries'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { EmptyState, PageHeader, StatusBadge } from '@/components/portal/PortalUI'

export default async function TransactionsPage() {
  const { transactions, projects } = await getAgreementData()
  const names = new Map(projects.map((project) => [project.id, project.name]))
  return <><PageHeader title="Movimientos" description="Solo los movimientos confirmados intervienen en los cálculos financieros. Una cotización o valor estimado no se presenta como ingreso." />{transactions.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Fecha</th><th>Proyecto</th><th>Tipo</th><th>Concepto</th><th>Valor</th><th>Estado</th><th>Soporte</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td data-label="Fecha">{formatDate(item.effective_date)}</td><td data-label="Proyecto">{item.project_id ? names.get(item.project_id) : 'Acuerdo'}</td><td data-label="Tipo">{item.type}</td><td data-label="Concepto">{item.description}</td><td data-label="Valor" className="portal-number">{formatMoney(item.amount)}</td><td data-label="Estado"><StatusBadge value={item.status}/></td><td data-label="Soporte">{item.support_document_id ? 'Disponible' : '—'}</td></tr>)}</tbody></table></div> : <EmptyState title="Sin movimientos" description="Todavía no hay movimientos económicos visibles en tus acuerdos." />}</>
}

