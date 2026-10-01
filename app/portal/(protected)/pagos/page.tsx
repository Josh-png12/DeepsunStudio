import { getAgreementData } from '@/lib/portal/queries'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { EmptyState, PageHeader, StatusBadge } from '@/components/portal/PortalUI'

export default async function PaymentsPage() {
  const { payments, participations, viewer } = await getAgreementData()
  const total = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const caused = participations.filter((item) => item.status !== 'adjusted').reduce((sum, item) => sum + Number(item.amount), 0)
  return <><PageHeader title="Pagos" description="Pagos realizados al inversionista y su relación con las participaciones causadas." /><section className="portal-metrics"><div className="portal-metric"><span>Participaciones causadas</span><strong>{formatMoney(caused)}</strong></div><div className="portal-metric"><span>Pagado</span><strong>{formatMoney(total)}</strong></div><div className="portal-metric"><span>Pendiente</span><strong>{formatMoney(Math.max(caused - total, 0))}</strong></div><div className="portal-metric"><span>Acuerdos</span><strong>{viewer.agreements.length}</strong></div></section>{payments.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Fecha</th><th>Valor</th><th>Método</th><th>Referencia</th></tr></thead><tbody>{payments.map((item) => <tr key={item.id}><td data-label="Fecha">{formatDate(item.payment_date)}</td><td data-label="Valor" className="portal-number">{formatMoney(item.amount)}</td><td data-label="Método">{item.payment_method}</td><td data-label="Referencia">{item.reference || '—'} {item.participation_id && <StatusBadge value="paid"/>}</td></tr>)}</tbody></table></div> : <EmptyState title="Sin pagos registrados" description="Los pagos aparecerán aquí junto con su referencia y soporte cuando sean realizados." />}</>
}

