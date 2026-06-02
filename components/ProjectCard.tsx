'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProjectDetail } from '@/data/projects'

const CATEGORY_LABELS: Record<ProjectDetail['category'], string> = {
  client: 'Cliente real',
  systems: 'Sistema',
  automation: 'Automatización',
  backend: 'Backend',
  fullstack: 'Full Stack',
}

const CATEGORY_COLORS: Record<ProjectDetail['category'], string> = {
  client: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  systems: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  automation: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  backend: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  fullstack: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

export default function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectDetail
  index?: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/proyectos/${project.slug}`}
        className="group block glass-card rounded-2xl p-6 border border-white/[0.07] hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_32px_-8px_rgba(59,130,246,0.2)] h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[project.category]}`}>
              {CATEGORY_LABELS[project.category]}
            </span>
            {project.highlighted && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">
                Destacado
              </span>
            )}
          </div>
          <span className="text-slate-600 text-xs font-mono flex-shrink-0">{project.year}</span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-white text-lg mb-2 group-hover:text-blue-300 transition-colors duration-200">
          {project.title}
        </h3>

        {/* Tagline */}
        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.tagline}
        </p>

        {/* Stack pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 text-[11px] border border-white/[0.07]"
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-600 text-[11px] border border-white/[0.07]">
              +{project.stack.length - 4}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200">
          <span>Ver caso de estudio</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>
    </motion.article>
  )
}
