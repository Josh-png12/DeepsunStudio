import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildSinceLastVisitActivity, canCreateProject, canManageProjectUpdates, canReadInternalProjectDetails, projectAcceptsFinancials, visibleMilestonesFor, visibleUpdatesFor } from '../lib/portal/project-tracking.ts'
import type { PortalDocument, ProjectBlocker, ProjectMilestone, ProjectUpdate } from '../lib/supabase/types.ts'

const update = (visibility: 'internal' | 'investor'): ProjectUpdate => ({ id: visibility, project_id: 'project-a', agreement_id: 'agreement-a', title: visibility, summary: 'Resumen', detail: null, progress_percent: 50, status: 'active', current_focus: null, next_step: null, visibility, is_highlight: false, created_by: 'admin-a', created_at: '2026-09-30T12:00:00Z', updated_at: '2026-09-30T12:00:00Z' })
const milestone = (investor_visible: boolean): ProjectMilestone => ({ id: String(investor_visible), project_id: 'project-a', agreement_id: 'agreement-a', title: 'Hito', description: null, status: 'pending', sort_order: 0, target_date: null, completed_at: null, investor_visible, created_by: 'admin-a', created_at: '2026-09-30T12:00:00Z', updated_at: '2026-09-30T12:00:00Z' })

test('admin puede crear proyecto', () => assert.equal(canCreateProject('admin'), true))
test('inversionista no puede crear proyecto', () => assert.equal(canCreateProject('investor'), false))
test('inversionista no puede leer notas internas', () => assert.equal(canReadInternalProjectDetails('investor'), false))
test('inversionista no ve update interno', () => assert.deepEqual(visibleUpdatesFor('investor', [update('internal')]), []))
test('inversionista sí ve update publicado', () => assert.equal(visibleUpdatesFor('investor', [update('investor')]).length, 1))
test('oportunidad no acepta movimientos financieros', () => {
  for (const status of ['potential', 'proposal', 'negotiation'] as const) assert.equal(projectAcceptsFinancials(status), false)
  assert.equal(projectAcceptsFinancials('contracted'), true)
})
test('hitos visibles se filtran para el inversionista', () => assert.deepEqual(visibleMilestonesFor('investor', [milestone(false), milestone(true)]).map((item) => item.investor_visible), [true]))
test('admin puede crear avances', () => assert.equal(canManageProjectUpdates('admin'), true))
test('inversionista no puede editar avances', () => assert.equal(canManageProjectUpdates('investor'), false))

test('desde tu última visita excluye actividad interna', () => {
  const blockers: ProjectBlocker[] = [{ id: 'blocker-private', project_id: 'project-a', agreement_id: 'agreement-a', title: 'Interno', description: 'Solo equipo', severity: 'low', status: 'open', investor_visible: false, resolved_at: null, created_by: 'admin-a', created_at: '2026-09-30T12:00:00Z', updated_at: '2026-09-30T12:00:00Z' }]
  const documents: PortalDocument[] = []
  const result = buildSinceLastVisitActivity({ lastSeenAt: '2026-09-29T00:00:00Z', visibleProjectIds: new Set(['project-a']), updates: [update('internal'), update('investor')], milestones: [milestone(false)], blockers, documents })
  assert.deepEqual(result.map((item) => item.id), ['investor'])
})

test('RLS exige membresía y visibilidad para proyectos de inversionista', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202609300004_project_tracking_rls.sql', import.meta.url), 'utf8')
  assert.match(sql, /investor_visible and public\.is_agreement_member\(agreement_id\)/)
  assert.match(sql, /project internal details admin select/)
  assert.match(sql, /project updates admin insert/)
  assert.match(sql, /project updates admin update/)
})

test('RLS protege avances, hitos, bloqueos y documentos por visibilidad', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202609300004_project_tracking_rls.sql', import.meta.url), 'utf8')
  assert.match(sql, /visibility = 'investor'/)
  assert.match(sql, /milestones select permitted/)
  assert.match(sql, /blockers select permitted/)
  assert.match(sql, /documents select permitted/)
})
