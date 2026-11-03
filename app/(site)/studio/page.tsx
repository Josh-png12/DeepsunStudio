import type { Metadata } from 'next'
import StudioView from '@/components/site/StudioView'

export const metadata: Metadata = {
  title: 'DeepSun Studio — Agencia de Desarrollo Web Colombia',
  description:
    'Agencia de desarrollo web y automatización para negocios en Colombia. Sitios web, WhatsApp bots y sistemas a medida que generan resultados reales.',
}

export default function StudioPage() {
  return <StudioView />
}
