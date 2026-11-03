import { pageMeta } from '@/lib/seo'
import ContactoView from '@/components/site/ContactoView'

export const dynamic = 'force-dynamic'

export const metadata = pageMeta({
  title: 'Contacto',
  description:
    'Cuéntanos qué necesita tu negocio y te respondemos con una propuesta concreta. Formulario de cinco pasos, WhatsApp y correo.',
  path: '/contacto',
})

export default function ContactoPage() {
  return <ContactoView />
}
