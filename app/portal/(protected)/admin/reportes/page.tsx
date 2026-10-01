import { PrintButton } from '@/components/portal/PrintButton'
import { PageHeader, SectionTitle, StatusBadge } from '@/components/portal/PortalUI'
import { calculateFinancialBreakdown } from '@/lib/portal/finance'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { getAgreementData } from '@/lib/portal/queries'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: requestedMonth } = await searchParams
  const month = /^\d{4}-\d{2}$/.test(requestedMonth ?? '') ? requestedMonth! : new Date().toISOString().slice(0, 7)
  const { viewer, projects, transactions, participations, payments, projectUpdates, milestones, blockers } = await getAgreementData()
  const monthTransactions = transactions.filter((item) => item.effective_date.startsWith(month))
  const monthParticipations = participations.filter((item) => item.calculated_at.startsWith(month))
  const monthPayments = payments.filter((item) => item.payment_date.startsWith(month))
  const monthUpdates = projectUpdates.filter((item) => item.created_at.startsWith(month))
  const completedMilestones = milestones.filter((item) => item.completed_at?.startsWith(month))
  const finance = calculateFinancialBreakdown(monthTransactions.map((item) => ({ type: item.type, amount: Number(item.amount), status: item.status })))
  const caused = monthParticipations.filter((item) => item.status !== 'adjusted').reduce((sum, item) => sum + Number(item.amount), 0)
  const paid = monthPayments.reduce((sum, item) => sum + Number(item.amount), 0)
  const projectNames = new Map(projects.map((item) => [item.id, item.public_name]))
  const cap = viewer.agreements.reduce((sum, item) => sum + Number(item.contractual_cap), 0)
  const opportunities = projects.filter((item) => ['potential', 'proposal', 'negotiation'].includes(item.status))
  const relevantBlockers = blockers.filter((item) => item.status === 'open')

  return <>
    <PageHeader title="Informe mensual" description="Corte operativo y financiero listo para impresión o guardado como PDF." action={<PrintButton />} />
    <form className="portal-report-filter" method="get"><label>Periodo<input type="month" name="month" defaultValue={month}/></label><button className="portal-button portal-button-secondary" type="submit">Aplicar periodo</button></form>
    <p className="portal-print-only">DeepSun Studio · Informe mensual {month} · generado {formatDate(new Date().toISOString())}</p>
    <section className="portal-metrics"><div className="portal-metric"><span>Ingresos confirmados</span><strong>{formatMoney(finance.grossIncome)}</strong></div><div className="portal-metric"><span>Costos directos</span><strong>{formatMoney(finance.directCosts)}</strong></div><div className="portal-metric"><span>Ganancia neta</span><strong>{formatMoney(finance.netProfit)}</strong></div><div className="portal-metric"><span>Participaciones causadas</span><strong>{formatMoney(caused)}</strong></div></section>
    <section className="portal-detail-grid portal-section"><div><SectionTitle>Estado del portafolio</SectionTitle><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Proyecto</th><th>Estado</th><th>Avance</th><th>Entrega</th></tr></thead><tbody>{projects.map((item) => <tr key={item.id}><td data-label="Proyecto">{item.public_name}</td><td data-label="Estado"><StatusBadge value={item.status}/></td><td data-label="Avance">{item.progress_percent}%</td><td data-label="Entrega">{formatDate(item.estimated_end_date)}</td></tr>)}</tbody></table></div></div><aside className="portal-panel"><h2>Conciliación del periodo</h2><dl className="portal-definition-list"><div><dt>Participaciones</dt><dd>{formatMoney(caused)}</dd></div><div><dt>Pagos</dt><dd>{formatMoney(paid)}</dd></div><div><dt>Pendiente del mes</dt><dd>{formatMoney(Math.max(caused - paid, 0))}</dd></div><div><dt>Límite contractual acumulado</dt><dd>{formatMoney(cap)}</dd></div></dl><p className="portal-disclaimer">El límite máximo contractual no constituye una rentabilidad garantizada.</p></aside></section>
    <section className="portal-section portal-editorial-grid"><div><SectionTitle>Avances publicados</SectionTitle><div className="portal-activity">{monthUpdates.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{projectNames.get(item.project_id)} · {item.summary}</small></span><time className="portal-activity-time">{formatDate(item.created_at)}</time></article>)}</div></div><div><SectionTitle>Hitos completados</SectionTitle><div className="portal-activity">{completedMilestones.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{projectNames.get(item.project_id)}</small></span><time className="portal-activity-time">{formatDate(item.completed_at)}</time></article>)}</div></div></section>
    <section className="portal-section portal-editorial-grid"><div><SectionTitle>Oportunidades relevantes</SectionTitle><div className="portal-activity">{opportunities.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.public_name}</strong><small><StatusBadge value={item.status}/> · Valor comercial estimado {formatMoney(item.estimated_value)}</small></span></article>)}</div><p className="portal-disclaimer">Las oportunidades no representan ingresos recibidos ni participación causada.</p></div><div><SectionTitle>Bloqueos relevantes</SectionTitle><div className="portal-activity">{relevantBlockers.map((item) => <article className="portal-activity-item" key={item.id}><span className="portal-activity-mark"/><span><strong>{item.title}</strong><small>{projectNames.get(item.project_id)} · severidad {item.severity}</small></span></article>)}</div></div></section>
    <section className="portal-section"><SectionTitle>Objetivos del próximo mes</SectionTitle><div className="portal-hanging-list">{projects.filter((item) => item.next_step).map((item) => <div key={item.id}><time>{item.progress_percent}%</time><span><strong>{item.public_name}</strong><small>{item.next_step}</small></span></div>)}</div></section>
  </>
}
