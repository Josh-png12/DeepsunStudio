import Link from 'next/link'
import { requireViewer } from '@/lib/portal/auth'
import { logoutAction } from '@/lib/portal/actions'
import { formatDateTime } from '@/lib/portal/format'
import { PageHeader } from '@/components/portal/PortalUI'

export default async function SecurityPage() {
  const viewer = await requireViewer()
  return <><PageHeader title="Seguridad" description="Revisa la sesión actual y gestiona las credenciales de acceso."/><section className="portal-panel"><dl className="portal-definition-list"><div><dt>Correo</dt><dd>{viewer.user.email}</dd></div><div><dt>Contraseña</dt><dd>Protegida</dd></div><div><dt>Última actualización</dt><dd>{formatDateTime(viewer.user.updated_at)}</dd></div><div><dt>Sesión actual</dt><dd>Activa</dd></div><div><dt>Autenticación en dos pasos</dt><dd>Preparada para próxima fase</dd></div></dl><div className="portal-form-actions"><Link className="portal-button portal-button-secondary" href="/portal/forgot-password">Cambiar contraseña</Link><form action={logoutAction}><button className="portal-button portal-button-primary" type="submit">Cerrar sesión</button></form></div></section></>
}

