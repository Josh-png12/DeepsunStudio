'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
}

export default function BlogCard({
  post,
  index = 0,
}: {
  post: BlogPost
  index?: number
}) {
  const formatted = new Date(post.date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block glass-card rounded-2xl p-6 border border-white/[0.07] hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_32px_-8px_rgba(59,130,246,0.2)] h-full"
      >
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">
            {post.category}
          </span>
          <span className="text-slate-600 text-xs">{post.readTime} lectura</span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-white text-lg mb-2 leading-snug group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <time className="text-slate-600 text-xs">{formatted}</time>
          <div className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200">
            <span>Leer</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
