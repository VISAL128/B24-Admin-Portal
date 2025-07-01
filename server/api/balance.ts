import { defineEventHandler, readBody } from 'h3'
import type { BalanceQueryRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const body = await readBody<BalanceQueryRequest>(event)

  const settlements = Array.from({ length: 5 }, (_, i) => {
    // Calculate settlement amount
    const settlementAmount = 1000 * (i + 1)
    
    // Set number of transaction allocations to 6 for all settlements
    const transactionCount = 6
    // Define weights for uneven distribution (summing to 1)
    const weights = [0.10, 0.15, 0.15, 0.20, 0.20, 0.20]
    // Calculate transaction amounts based on weights
    const transactionAmounts = weights.map(weight => settlementAmount * weight)

    // Generate transaction_allocations array
    const transaction_allocations = Array.from({ length: transactionCount }, (_, t) => ({
      id: `txn-${i + 1}-${t + 1}`,
      amount: transactionAmounts[t],
      currency_id: 'KHR',
      bank_ref: `bankref-${1000 + i * 10 + t}`,
      bank_name: 'ABA',
      tran_date: `2025-01-${String(i + 1).padStart(2, '0')} 10:${String(t * 10).padStart(2, '0')}:00`
    }))

    return {
      id: `SETTLEMENT-${i + 1}`,
      party_id: `cpo-${i + 1}`,
      party_type: 2,
      amount: settlementAmount,
      settlement_bank_id: 'AC',
      currency: 'KHR',
      supplier: {
        id: `supplier-${i + 1}`,
        code: `SUP-${7900 + i}`,
        name: `Supplier ${String.fromCharCode(65 + i)}`,
        phone: 88930400 + i,
        email: `supplier${i + 1}@example.com`,
        address: ''
      },
      cpo: {
        id: `cpo-${i + 1}`,
        code: `CPO-${7900 + i}`,
        name: `CPO ${String.fromCharCode(65 + i)}`,
        phone: 88930400 + i,
        email: `cpo${i + 1}@example.com`,
        address: ''
      },
      transaction_allocations
    }
  })

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      settlements
    }
  }
})