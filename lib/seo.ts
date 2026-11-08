import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

const OG_IMAGE = { url: '/og-image', width: 1200, height: 630, alt: 'DeepSun Studio — Del caos a lo claro.' }

/**
 * Per-page metadata: self-referencing canonical, Open Graph and Twitter.
 * The site is indexed in Spanish only (English is a client-side view), so no hreflang alternates are emitted.
 */
export function pageMeta({
  title,
  description,
  path,
  type = 'website',
  absoluteTitle = false,
  publishedTime,
  image,
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  absoluteTitle?: boolean
  publishedTime?: string
  /** Same-site path of a page-specific social image (e.g. a blog cover); defaults to the brand /og-image. */
  image?: string
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE.name}`
  const ogImage = image ? { url: image, width: 1200, height: 630, alt: title } : OG_IMAGE
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE.name,
      locale: 'es_CO',
      title: fullTitle,
      description,
      images: [ogImage],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [ogImage.url] },
  }
}

export const DEFAULT_TITLE = 'DeepSun Studio — Estudio digital independiente en Colombia'
export const DEFAULT_DESCRIPTION =
  'Estudio digital independiente en Riohacha, Colombia. Diseño digital, desarrollo web, software a medida y automatización para negocios en Colombia y Latinoamérica.'
