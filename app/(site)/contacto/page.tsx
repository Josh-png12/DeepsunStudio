import type { Metadata } from 'next'
import ContactoView from '@/components/site/ContactoView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Cuéntanos qué necesita tu negocio. Respondemos en menos de 24 horas con una propuesta concreta.',
}

export default function ContactoPage() {
  return <ContactoView />
}
