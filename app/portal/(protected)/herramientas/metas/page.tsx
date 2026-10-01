import { createGoalAction, deleteGoalAction } from '@/lib/portal/actions'
import { formatDate, formatMoney } from '@/lib/portal/format'
import { getPersonalToolsData } from '@/lib/portal/queries'
import { PageHeader, ToolsNotice } from '@/components/portal/PortalUI'

export default async function GoalsPage() {
  const { goals } = await getPersonalToolsData()
  const renderedAt = new Date().getTime()

  return (
    <>
      <PageHeader title="Metas de ahorro" description="Calcula un ritmo de ahorro orientativo a partir de tu meta personal." />
      <ToolsNotice />
      <div className="portal-admin-grid">
        <form action={createGoalAction} className="portal-form portal-admin-form">
          <h2>Nueva meta</h2>
          <label>Nombre<input name="name" required /></label>
          <label>Monto objetivo<input name="target_amount" type="number" min="1" step="0.01" required /></label>
          <label>Monto ahorrado<input name="saved_amount" type="number" min="0" step="0.01" defaultValue="0" /></label>
          <label>Fecha objetivo<input name="target_date" type="date" /></label>
          <button className="portal-button portal-button-primary" type="submit">Crear meta</button>
        </form>
        <div className="portal-project-list">
          {goals.map((goal) => {
            const missing = Math.max(Number(goal.target_amount) - Number(goal.saved_amount), 0)
            const weeks = goal.target_date
              ? Math.max(Math.ceil((new Date(goal.target_date).getTime() - renderedAt) / 604800000), 1)
              : null
            const progress = Math.min(Number(goal.saved_amount) / Number(goal.target_amount) * 100, 100)
            return (
              <article className="portal-panel" key={goal.id}>
                <h2>{goal.name}</h2>
                <div className="portal-progress"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
                <dl className="portal-definition-list">
                  <div><dt>Objetivo</dt><dd>{formatMoney(goal.target_amount)}</dd></div>
                  <div><dt>Ahorrado</dt><dd>{formatMoney(goal.saved_amount)}</dd></div>
                  <div><dt>Faltante</dt><dd>{formatMoney(missing)}</dd></div>
                  <div><dt>Fecha</dt><dd>{formatDate(goal.target_date)}</dd></div>
                  <div><dt>Ahorro semanal sugerido</dt><dd>{weeks ? formatMoney(missing / weeks) : 'Define una fecha'}</dd></div>
                </dl>
                <form action={deleteGoalAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <button className="portal-text-link" type="submit">Eliminar meta</button>
                </form>
              </article>
            )
          })}
        </div>
      </div>
    </>
  )
}

