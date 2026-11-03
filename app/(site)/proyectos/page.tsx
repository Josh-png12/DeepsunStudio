import { pageMeta } from '@/lib/seo'
import ProyectosView from '@/components/site/ProyectosView'
import { getCases } from '@/lib/site-cases'

export const metadata = pageMeta({
  title: 'Proyectos — Casos de estudio',
  description:
    'Casos de estudio de DeepSun Studio: sitios web, plataformas y software a medida, con su problema, solución y resultado.',
  path: '/proyectos',
})

export default function ProyectosPage() {
  return <ProyectosView cases={getCases()} />
}
