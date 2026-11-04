// eslint-disable-next-line @typescript-eslint/no-require-imports -- next.config.js is CommonJS
const { isIndexable } = require('./lib/indexing')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Non-production deployments (Vercel Preview, local builds) must never be indexed: HTTP header on every response.
  async headers() {
    if (isIndexable) return []
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }]
  },
}

module.exports = nextConfig
