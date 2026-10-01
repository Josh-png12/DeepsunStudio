import { inviteUserAction } from '@/lib/portal/actions'
import { getAdminContext } from '@/lib/portal/queries'
import { formatDate } from '@/lib/portal/format'
import { PageHeader } from '@/components/portal/PortalUI'

export default async function AdminUsersPage() {
  const { viewer, members, profiles } = await getAdminContext()
  const agreementNames = new Map(viewer.agreements.map((item) => [item.id,item.name]))
  return <><PageHeader title="Usuarios" description="Las cuentas se crean por invitación; no existe registro público de inversionistas."/><div className="portal-admin-grid"><form action={inviteUserAction} className="portal-form portal-admin-form"><h2>Invitar inversionista</h2><label>Nombre completo<input name="full_name" required/></label><label>Correo<input name="email" type="email" required/></label><label>Acuerdo<select name="agreement_id">{viewer.agreements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><p className="portal-confirm-copy">Esta operación requiere SUPABASE_SERVICE_ROLE_KEY en el servidor. La clave nunca se envía al navegador.</p><button className="portal-button portal-button-primary" type="submit">Enviar invitación</button></form><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Nombre</th><th>Rol</th><th>Acuerdo</th><th>Miembro desde</th></tr></thead><tbody>{members.map((member) => { const profile = profiles.find((item) => item.id === member.user_id); return <tr key={`${member.agreement_id}-${member.user_id}`}><td data-label="Nombre">{profile?.full_name || member.user_id}</td><td data-label="Rol">{member.role === 'admin' ? 'Administrador' : 'Inversionista'}</td><td data-label="Acuerdo">{agreementNames.get(member.agreement_id)}</td><td data-label="Miembro desde">{formatDate(member.created_at)}</td></tr> })}</tbody></table></div></div></>
}

