import { pageMeta } from '@/lib/seo'
import ServiciosView from '@/components/site/ServiciosView'

export const metadata = pageMeta({
  title: 'Servicios y precios',
  description:
    'Cuatro opciones con entregables claros: presencia básica, presencia profesional, automatización y bots, y software a medida. Precios de referencia en USD, COP y EUR.',
  path: '/servicios',
})

export default function ServiciosPage() {
  return <ServiciosView />
}
