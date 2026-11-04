import { MetadataRoute } from 'next'
import { isIndexable } from '@/lib/indexing'

// public/robots.txt was removed: a static file and this route would both answer /robots.txt.
export default function robots(): MetadataRoute.Robots {
  // Previews and any non-production build: block everything (the X-Robots-Tag header and <meta robots> say the same).
  if (!isIndexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/portal/'],
      },
    ],
    sitemap: 'https://www.deepsunstudio.com/sitemap.xml',
    host: 'https://www.deepsunstudio.com',
  }
}
