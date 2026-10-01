import { createExpenseAction, deleteExpenseAction } from '@/lib/portal/actions'
import { getPersonalToolsData } from '@/lib/portal/queries'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { PageHeader, ToolsNotice } from '@/components/portal/PortalUI'

export default async function ExpensesPage() {
  const { expenses } = await getPersonalToolsData()
  const currentMonth = new Date().toISOString().slice(0, 7)
  const month = expenses.filter((item) => item.occurred_on.startsWith(currentMonth))
  const income = month.filter((item) => item.kind === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
  const spending = month.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
  return <><PageHeader title="Gastos personales" description="Registro privado visible únicamente para tu usuario."/><ToolsNotice/><section className="portal-metrics"><div className="portal-metric"><span>Ingresos del mes</span><strong>{formatMoney(income)}</strong></div><div className="portal-metric"><span>Gastos del mes</span><strong>{formatMoney(spending)}</strong></div><div className="portal-metric"><span>Balance</span><strong>{formatMoney(income - spending)}</strong></div><div className="portal-metric"><span>Registros</span><strong>{month.length}</strong></div></section><div className="portal-admin-grid"><form action={createExpenseAction} className="portal-form portal-admin-form"><h2>Registrar movimiento personal</h2><label>Tipo<select name="kind"><option value="expense">Gasto</option><option value="income">Ingreso</option></select></label><label>Categoría<input name="category" required/></label><label>Concepto<input name="concept" required/></label><label>Valor<input name="amount" type="number" min="1" step="0.01" required/></label><label>Fecha<input name="occurred_on" type="date" required/></label><button className="portal-button portal-button-primary" type="submit">Guardar movimiento</button></form><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Valor</th><th></th></tr></thead><tbody>{expenses.map((item) => <tr key={item.id}><td data-label="Fecha">{formatDate(item.occurred_on)}</td><td data-label="Tipo">{item.kind === 'income' ? 'Ingreso' : 'Gasto'}</td><td data-label="Concepto">{item.concept}<br/><small>{item.category}</small></td><td data-label="Valor" className="portal-number">{formatMoney(item.amount)}</td><td data-label="Acción"><form action={deleteExpenseAction}><input type="hidden" name="id" value={item.id}/><button className="portal-text-link" type="submit">Eliminar</button></form></td></tr>)}</tbody></table></div></div></>
}

