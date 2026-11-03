import { deleteTestimonialAction, moderateTestimonialAction } from '@/lib/portal/intake-actions'
import { getTestimonialsForModeration } from '@/lib/portal/intake'
import { formatDateTime } from '@/lib/portal/format'
import { EmptyState, PageHeader } from '@/components/portal/PortalUI'

function Decision({ id, decision, label, primary = false }: { id: string; decision: string; label: string; primary?: boolean }) {
  return (
    <form action={moderateTestimonialAction}>
      <input type="hidden" name="testimonial_id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <button className={`portal-button ${primary ? 'portal-button-primary' : 'portal-button-secondary'}`} type="submit">{label}</button>
    </form>
  )
}

export default async function AdminTestimonialsPage() {
  const { testimonials, error } = await getTestimonialsForModeration()
  const pending = testimonials.filter((t) => !t.approved).length
  return (
    <>
      <PageHeader title="Testimonios" description={`Nada se publica sin tu aprobación. ${pending} pendientes de revisión. Solo administradores de plataforma.`} />
      {error && <p className="portal-form-error" role="alert">No se pudieron cargar los testimonios. Verifica la migración de intake y tu rol de administrador.</p>}
      {!error && testimonials.length === 0 && <EmptyState title="Sin testimonios" description="Los testimonios enviados desde la web aparecerán aquí para su revisión." />}
      <div className="portal-project-cards">
        {testimonials.map((t) => (
          <article key={t.id} className="portal-project-card">
            <h2>{t.name}{t.company || t.role ? <small> · {[t.role, t.company].filter(Boolean).join(' · ')}</small> : null}</h2>
            <p><strong>{t.approved ? (t.featured ? 'Publicado y destacado' : 'Publicado') : 'Pendiente'}</strong> · {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)} · {formatDateTime(t.created_at)}</p>
            <p>{t.message}</p>
            <p>
              {t.avatar_url && <a href={t.avatar_url} target="_blank" rel="noopener noreferrer">Foto</a>}{' '}
              {t.result_image_url && <a href={t.result_image_url} target="_blank" rel="noopener noreferrer">Imagen</a>}{' '}
              {t.video_url && <a href={t.video_url} target="_blank" rel="noopener noreferrer">Video</a>}
            </p>
            <div className="portal-command-actions">
              {!t.approved && <Decision id={t.id} decision="approve" label="Aprobar y publicar" primary />}
              {t.approved && <Decision id={t.id} decision="unapprove" label="Retirar de la web" />}
              {t.approved && <Decision id={t.id} decision={t.featured ? 'unfeature' : 'feature'} label={t.featured ? 'Quitar destacado' : 'Destacar'} />}
            </div>
            <details>
              <summary>Eliminar testimonio</summary>
              <form action={deleteTestimonialAction}>
                <input type="hidden" name="testimonial_id" value={t.id} />
                <p className="portal-confirm-copy">Se elimina de forma permanente (los archivos quedan en el almacenamiento hasta limpiarlos).</p>
                <button className="portal-button portal-button-secondary" type="submit">Confirmar eliminación</button>
              </form>
            </details>
          </article>
        ))}
      </div>
    </>
  )
}
