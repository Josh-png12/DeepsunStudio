import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
