import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
import { notFound } from 'next/navigation'
import CaseDetail from '@/components/site/CaseDetail'
import { getCase, getCases } from '@/lib/site-cases'

export async function generateStaticParams() {
  return getCases().map((c) => ({ slug: c.meta.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCase(slug)
  if (!c) return {}
  return pageMeta({
    title: `${c.project.title} — Caso de estudio`,
    description: c.project.tagline.es,
    path: `/proyectos/${slug}`,
  })
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const all = getCases()
  const i = all.findIndex((c) => c.meta.slug === slug)
  if (i < 0) notFound()
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Proyectos', path: '/proyectos' }, { name: all[i].project.title, path: `/proyectos/${slug}` }]} />
      <CaseDetail current={all[i]} prev={all[(i - 1 + all.length) % all.length]} next={all[(i + 1) % all.length]} />
    </>
  )
}
