import { deleteLeadAction, updateLeadAction } from '@/lib/portal/intake-actions'
import { getLeads, LEAD_STATUSES, type LeadStatus } from '@/lib/portal/intake'
import { formatDateTime } from '@/lib/portal/format'
import { EmptyState, PageHeader } from '@/components/portal/PortalUI'

const STATUS_LABEL: Record<LeadStatus, string> = { new: 'Nueva', contacted: 'Contactada', qualified: 'Calificada', won: 'Ganada', lost: 'Perdida', spam: 'Spam' }
const BUSINESS: Record<string, string> = { hotel: 'Hotel / Turismo', salud: 'Salud / Clínica', restaurante: 'Restaurante / Comida', consultorio: 'Firma / Consultorio', educacion: 'Educación', empresa: 'Empresa / Startup', comercio: 'Comercio / Tienda', otro: 'Otro' }
const NEEDS: Record<string, string> = { sitio_nuevo: 'Sitio nuevo', mejorar: 'Mejorar sitio', whatsapp_bot: 'WhatsApp bot', sistema: 'Sistema a medida', seo: 'SEO', asesoria: 'Asesoría' }
const BUDGET: Record<string, string> = { menos_500: '< US$500', '500_1500': 'US$500–1.500', '1500_3000': 'US$1.500–3.000', mas_3000: '> US$3.000', no_se: 'Sin definir' }
const TIMELINE: Record<string, string> = { asap: 'Lo antes posible', mes: 'Próximo mes', '2_3_meses': '2–3 meses', explorando: 'Explorando' }

export default async function AdminLeadsPage() {
  const { leads, error } = await getLeads()
  const open = leads.filter((l) => l.status === 'new').length
  return (
    <>
      <PageHeader title="Solicitudes" description={`Contactos recibidos por los formularios públicos. ${open} sin atender. Solo administradores de plataforma.`} />
      {error && <p className="portal-form-error" role="alert">No se pudieron cargar las solicitudes. Verifica la migración de intake y tu rol de administrador.</p>}
      {!error && leads.length === 0 && <EmptyState title="Sin solicitudes" description="Cuando alguien complete el formulario de contacto aparecerá aquí." />}
      <div className="portal-project-cards">
        {leads.map((l) => (
          <article key={l.id} className="portal-project-card">
            <h2>{l.name} <small>· {formatDateTime(l.created_at)} · {l.source === 'home_quick' ? 'formulario rápido' : 'formulario completo'}</small></h2>
            <p>
              <a href={`mailto:${l.email}`}>{l.email}</a>
              {l.whatsapp ? <> · WhatsApp: {l.whatsapp}</> : null}
            </p>
            <p>{BUSINESS[l.business_type] ?? l.business_type} · {l.needs.map((n) => NEEDS[n] ?? n).join(', ')} · {BUDGET[l.budget] ?? l.budget} · {TIMELINE[l.timeline] ?? l.timeline}</p>
            {l.message && <p>{l.message}</p>}
            <form action={updateLeadAction} className="portal-form">
              <input type="hidden" name="lead_id" value={l.id} />
              <label>Estado
                <select name="status" defaultValue={l.status}>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
              </label>
              <label>Notas internas<textarea name="admin_notes" rows={2} maxLength={2000} defaultValue={l.admin_notes ?? ''} /></label>
              <button className="portal-button portal-button-secondary" type="submit">Guardar</button>
            </form>
            <details>
              <summary>Eliminar solicitud</summary>
              <form action={deleteLeadAction}>
                <input type="hidden" name="lead_id" value={l.id} />
                <p className="portal-confirm-copy">Se elimina de forma permanente. Si es spam, mejor márcala como «Spam».</p>
                <button className="portal-button portal-button-secondary" type="submit">Confirmar eliminación</button>
              </form>
            </details>
          </article>
        ))}
      </div>
    </>
  )
}
