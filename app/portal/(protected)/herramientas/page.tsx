import { PageHeader, ToolLink, ToolsNotice } from '@/components/portal/PortalUI'

export default function ToolsPage() {
  return <><PageHeader title="Herramientas personales" description="Organiza información propia sin mezclarla con los registros contractuales." /><ToolsNotice/><div className="portal-tools-list"><ToolLink href="/portal/herramientas/gastos" icon="ledger" title="Gastos personales" description="Ingresos, gastos y balance mensual."/><ToolLink href="/portal/herramientas/metas" icon="reports" title="Metas de ahorro" description="Avance, faltante y ahorro semanal sugerido."/><ToolLink href="/portal/herramientas/recordatorios" icon="updates" title="Recordatorios" description="Fechas, estados y notas personales."/></div></>
}

