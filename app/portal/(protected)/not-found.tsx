import Link from 'next/link'

export default function PortalNotFound() {
  return <section className="portal-empty"><span className="portal-empty-mark"/><h1>No encontramos este recurso</h1><p>Puede que no exista o que no pertenezca a uno de tus acuerdos.</p><Link className="portal-button portal-button-secondary" href="/portal/dashboard">Volver al resumen</Link></section>
}

