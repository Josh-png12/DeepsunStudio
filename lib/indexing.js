/**
 * Only the real production deployment may be indexed.
 * Vercel sets VERCEL_ENV to 'production' | 'preview' | 'development'; anywhere else (local build, CI, staging) it is unset,
 * which is treated as NOT indexable on purpose. CommonJS so that next.config.js can use it as well.
 */
const isIndexable = process.env.VERCEL_ENV === 'production'

/**
 * Public origin used for canonical / Open Graph / sitemap / JSON-LD.
 * Production: always the official domain. Anything else: the deployment's own host (VERCEL_URL, set by Vercel at build time),
 * so a Preview never advertises deepsunstudio.com as its own address. Local builds fall back to localhost.
 */
function siteOrigin(productionUrl) {
  if (isIndexable) return productionUrl
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

module.exports = { isIndexable, siteOrigin }
