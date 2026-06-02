'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import ProjectCard from '@/components/ProjectCard'
import { projectDetails } from '@/data/projects'
import type { ProjectDetail } from '@/data/projects'
import { motion } from 'framer-motion'

type Filter = 'todos' | ProjectDetail['category']

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'client', label: 'Clientes' },
  { value: 'systems', label: 'Sistemas' },
  { value: 'automation', label: 'Automatización' },
  { value: 'backend', label: 'Backend' },
]

export default function ProyectosPage() {
  const [active, setActive] = useState<Filter>('todos')

  const filtered = active === 'todos'
    ? projectDetails
    : projectDetails.filter((p) => p.category === active)

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/[0.07] rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <div className="tag-pill mb-5 inline-flex">Proyectos</div>
              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
                Proyectos reales.<br />
                <span className="gradient-flow">Resultados medibles.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                No mostramos mockups. Mostramos trabajo que está funcionando en producción ahora mismo.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Filter tabs ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar proyectos">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActive(value)}
                role="tab"
                aria-selected={active === value}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                  active === value
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300 glass-card border border-white/[0.07]'
                }`}
              >
                {active === value && (
                  <motion.span
                    layoutId="filter-bg"
                    className="absolute inset-0 bg-blue-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((project, i) => (
                <motion.div key={project.slug} layout>
                  <ProjectCard project={project} index={i} />
                </motion.div>
              ))}
            </motion.div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500">No hay proyectos en esta categoría.</p>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
