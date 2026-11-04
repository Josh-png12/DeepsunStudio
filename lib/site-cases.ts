import { projects, type Project } from '@/data/portfolio'
import { projectDetails } from '@/data/projects'
import { CASES, type CaseMeta } from '@/lib/site-content'
import { CASE_PUBLISHED } from '@/lib/launch'

/** Public shape of a case: the technical stack and repository links never leave the server. */
export type PublicProject = Omit<Project, 'stack' | 'github'>

export interface CaseView {
  meta: CaseMeta
  project: PublicProject
  client?: string
  year: number
  demo?: string
}

// Public case data never exposes the stack: only problem, solution, outcome and deliverables are sent to the client.
export function getCases(): CaseView[] {
  return CASES.flatMap((meta) => {
    // Cases whose publication permission is pending are hidden everywhere (see lib/launch.ts); their content stays in the repo.
    if (!CASE_PUBLISHED[meta.slug]) return []
    const full = projects.find((p) => p.slug === meta.slug)
    if (!full) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stack, github, ...project } = full
    const detail = projectDetails.find((d) => d.slug === meta.slug)
    return [{ meta, project, client: detail?.client, year: project.year, demo: project.demo ?? detail?.demo }]
  })
}

export const getCase = (slug: string) => getCases().find((c) => c.meta.slug === slug)
