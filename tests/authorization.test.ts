import assert from 'node:assert/strict'
import test from 'node:test'
import { canAccessAdminRoute, canAccessAgreement, canManageAgreement } from '../lib/portal/authorization.ts'

const memberships = [
  { agreement_id: 'agreement-a', user_id: 'investor-a', role: 'investor' as const },
  { agreement_id: 'agreement-a', user_id: 'admin-a', role: 'admin' as const },
]

test('inversionista puede consultar su acuerdo', () => {
  assert.equal(canAccessAgreement('investor-a', 'agreement-a', memberships), true)
})

test('inversionista no puede administrar', () => {
  assert.equal(canManageAgreement('investor-a', 'agreement-a', memberships, 'investor'), false)
  assert.equal(canAccessAdminRoute('investor-a', memberships, 'investor'), false)
})

test('administrador miembro puede gestionar el acuerdo', () => {
  assert.equal(canManageAgreement('admin-a', 'agreement-a', memberships, 'admin'), true)
  assert.equal(canAccessAdminRoute('admin-a', memberships, 'admin'), true)
})

test('un usuario no puede consultar un acuerdo ajeno', () => {
  assert.equal(canAccessAgreement('investor-a', 'agreement-b', memberships), false)
})

