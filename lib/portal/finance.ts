import type { TransactionStatus, TransactionType } from '@/lib/supabase/types'

export interface FinancialEntry {
  type: TransactionType
  amount: number
  status: TransactionStatus
}

export interface FinancialBreakdown {
  grossIncome: number
  directCosts: number
  refunds: number
  chargebacks: number
  adjustments: number
  netProfit: number
}

export function calculateFinancialBreakdown(entries: FinancialEntry[]): FinancialBreakdown {
  const confirmed = entries.filter((entry) => entry.status === 'confirmed')
  const total = (type: TransactionType) =>
    confirmed
      .filter((entry) => entry.type === type)
      .reduce((sum, entry) => sum + entry.amount, 0)

  const grossIncome = total('income')
  const directCosts = total('cost')
  const refunds = total('refund')
  const chargebacks = total('chargeback')
  const adjustments = total('adjustment')
  const netProfit = Math.max(
    grossIncome - directCosts - refunds - chargebacks + adjustments,
    0,
  )

  return { grossIncome, directCosts, refunds, chargebacks, adjustments, netProfit }
}

export function calculateParticipation(params: {
  netProfit: number
  percentage: number
  contractualCap: number
  accumulated: number
}): number {
  const { netProfit, percentage, contractualCap, accumulated } = params
  const raw = Math.max(netProfit, 0) * Math.max(percentage, 0) / 100
  const remaining = Math.max(contractualCap - Math.max(accumulated, 0), 0)
  return Math.round(Math.min(raw, remaining) * 100) / 100
}

