import { MetadataRoute } from 'next'
import { getCases } from '@/lib/site-cases'
import { getPublishedSlugs } from '@/lib/blog'
import { SITE } from '@/lib/site'

const BASE = SITE.url // official domain in production, the deployment's own URL elsewhere

export default function sitemap(): MetadataRoute.Sitemap {
  // Only what is actually published: hidden cases and draft posts never reach the sitemap.
  const projectSlugs = getCases().map((c) => c.meta.slug)
  const blogSlugs = getPublishedSlugs()

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/studio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/servicios`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.95 },
    { url: `${BASE}/proyectos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/contacto`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.9 },
    ...projectSlugs.map((slug) => ({
      url: `${BASE}/proyectos/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
