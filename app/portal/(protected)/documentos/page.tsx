import { getAgreementData } from '@/lib/portal/queries'
import { bytes, formatDate } from '@/lib/portal/format'
import { EmptyState, PageHeader } from '@/components/portal/PortalUI'

export default async function DocumentsPage() {
  const { documents, projects } = await getAgreementData()
  const names = new Map(projects.map((project) => [project.id, project.name]))
  return <><PageHeader title="Documentos" description="Contratos, facturas, recibos, comprobantes e informes. Los enlaces de acceso son temporales y la ruta interna nunca se expone." />{documents.length ? <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Proyecto</th><th>Tamaño</th><th>Acceso</th></tr></thead><tbody>{documents.map((item) => <tr key={item.id}><td data-label="Nombre">{item.name}</td><td data-label="Tipo">{item.type}</td><td data-label="Fecha">{formatDate(item.created_at)}</td><td data-label="Proyecto">{item.project_id ? names.get(item.project_id) : 'Acuerdo'}</td><td data-label="Tamaño">{bytes(item.size)}</td><td data-label="Acceso"><a className="portal-button portal-button-secondary" href={`/portal/documentos/${item.id}/download`}>Abrir documento</a></td></tr>)}</tbody></table></div> : <EmptyState title="Sin documentos" description="Todavía no se han publicado soportes para tus acuerdos." />}</>
}

