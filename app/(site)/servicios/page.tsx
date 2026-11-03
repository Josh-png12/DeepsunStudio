import type { Metadata } from 'next'
import ServiciosView from '@/components/site/ServiciosView'

export const metadata: Metadata = {
  title: 'Servicios y precios',
  description:
    'Cuatro planes claros: presencia básica, presencia profesional, automatización y bots, y software a medida. Precios de referencia en USD, COP y EUR.',
}

export default function ServiciosPage() {
  return <ServiciosView />
}
