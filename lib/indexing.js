/**
 * Only the real production deployment may be indexed.
 * Vercel sets VERCEL_ENV to 'production' | 'preview' | 'development'; anywhere else (local build, CI, staging) it is unset,
 * which is treated as NOT indexable on purpose. CommonJS so that next.config.js can use it as well.
 */
const isIndexable = process.env.VERCEL_ENV === 'production'

module.exports = { isIndexable }
