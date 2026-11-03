import { projects, type Project } from '@/data/portfolio'
import { projectDetails } from '@/data/projects'
import { CASES, type CaseMeta } from '@/lib/site-content'

export interface CaseView {
  meta: CaseMeta
  project: Project
  client?: string
  year: number
  demo?: string
}

// Public case data never exposes the stack: only problem, solution, outcome and deliverables are used.
export function getCases(): CaseView[] {
  return CASES.flatMap((meta) => {
    const project = projects.find((p) => p.slug === meta.slug)
    if (!project) return []
    const detail = projectDetails.find((d) => d.slug === meta.slug)
    return [{ meta, project, client: detail?.client, year: project.year, demo: project.demo ?? detail?.demo }]
  })
}

export const getCase = (slug: string) => getCases().find((c) => c.meta.slug === slug)
