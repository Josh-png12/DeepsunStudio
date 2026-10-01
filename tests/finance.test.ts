import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateFinancialBreakdown, calculateParticipation } from '../lib/portal/finance.ts'

test('calcula ganancia neta usando solo movimientos confirmados', () => {
  const result = calculateFinancialBreakdown([
    { type: 'income', amount: 2_000_000, status: 'confirmed' },
    { type: 'cost', amount: 500_000, status: 'confirmed' },
    { type: 'income', amount: 900_000, status: 'pending' },
  ])
  assert.equal(result.netProfit, 1_500_000)
})

test('calcula participación contractual del 20 por ciento', () => {
  assert.equal(calculateParticipation({ netProfit: 1_500_000, percentage: 20, contractualCap: 3_000_000, accumulated: 0 }), 300_000)
})

test('respeta el límite contractual acumulado', () => {
  assert.equal(calculateParticipation({ netProfit: 2_000_000, percentage: 20, contractualCap: 3_000_000, accumulated: 2_800_000 }), 200_000)
})

test('aplica ajustes y reversos sin borrar el movimiento original', () => {
  const result = calculateFinancialBreakdown([
    { type: 'income', amount: 2_000_000, status: 'confirmed' },
    { type: 'adjustment', amount: -700_000, status: 'confirmed' },
    { type: 'income', amount: 4_000_000, status: 'reversed' },
  ])
  assert.equal(result.netProfit, 1_300_000)
})

