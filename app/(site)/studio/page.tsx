import { pageMeta } from '@/lib/seo'
import StudioView from '@/components/site/StudioView'

export const metadata = pageMeta({
  title: 'El estudio',
  description:
    'DeepSun Studio es un estudio digital independiente en Riohacha, Colombia: diseño y desarrollo web, software a medida y automatización para negocios.',
  path: '/studio',
})

export default function StudioPage() {
  return <StudioView />
}
