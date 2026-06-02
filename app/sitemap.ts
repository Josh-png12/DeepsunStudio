import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/data/projects'
import fs from 'fs'
import path from 'path'

const BASE = 'https://www.deepsunstudio.com'

function getBlogSlugs(): string[] {
  const dir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const projectSlugs = getAllSlugs()
  const blogSlugs = getBlogSlugs()

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
