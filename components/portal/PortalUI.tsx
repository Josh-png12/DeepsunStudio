import Link from 'next/link'
import type { PortalIconName } from './Icon'
import { Icon } from './Icon'

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="portal-page-header">
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action && <div className="portal-page-action">{action}</div>}
    </header>
  )
}

export function StatusBadge({ value }: { value: string }) {
  const label: Record<string, string> = {
    potential: 'Potencial', proposal: 'Propuesta', negotiation: 'Negociación', contracted: 'Contratado',
    active: 'En ejecución', paused: 'En pausa', completed: 'Completado', pending: 'Pendiente', lead: 'Estimado',
    confirmed: 'Confirmado', reversed: 'Reversado', draft: 'Borrador', cancelled: 'Cancelado',
    calculated: 'Calculada', approved: 'Aprobada', paid: 'Pagada', adjusted: 'Ajustada',
    on_track: 'En curso', attention: 'Requiere atención', blocked: 'Bloqueado',
    in_progress: 'En progreso', open: 'Abierto', resolved: 'Resuelto',
  }
  return <span className="portal-status" data-status={value}>{label[value] ?? value}</span>
}

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="portal-empty">
      <span className="portal-empty-mark" aria-hidden="true" />
      <h2>{title}</h2><p>{description}</p>
      {href && action && <Link className="portal-button portal-button-secondary" href={href}>{action}<Icon name="arrow" /></Link>}
    </div>
  )
}

export function ToolsNotice() {
  return <p className="portal-legal-notice">Las herramientas personales son funcionalidades gratuitas adicionales de DeepSun Studio y no forman parte de las condiciones económicas, participación, rentabilidad ni contraprestaciones del acuerdo.</p>
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="portal-section-title"><h2>{children}</h2>{action}</div>
}

export function ToolLink({ href, icon, title, description }: { href: string; icon: PortalIconName; title: string; description: string }) {
  return <Link href={href} className="portal-tool-link"><Icon name={icon}/><span><strong>{title}</strong><small>{description}</small></span><Icon name="arrow"/></Link>
}
