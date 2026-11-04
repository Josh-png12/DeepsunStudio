import { pageMeta } from '@/lib/seo'
import { FORMS_ENABLED } from '@/lib/launch'
import ContactoView from '@/components/site/ContactoView'

export const dynamic = 'force-dynamic'

export const metadata = pageMeta({
  title: 'Contacto',
  description:
    FORMS_ENABLED
      ? 'Cuéntanos qué necesita tu negocio y te respondemos con una propuesta concreta. Formulario de cinco pasos, WhatsApp y correo.'
      : 'Cuéntanos qué necesita tu negocio y escríbenos por WhatsApp: es nuestro canal principal de contacto.',
  path: '/contacto',
})

export default function ContactoPage() {
  return <ContactoView />
}
