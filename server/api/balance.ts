import { defineEventHandler, readBody } from 'h3'
import type { BalanceQueryRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const body = await readBody<BalanceQueryRequest>(event)

  const settlements = Array.from({ length: 5 }, (_, i) => ({
    id: `SETTLEMENT-${i + 1}`,
    party_id: `cpo-${i + 1}`,
    party_type: 2,
    amount: 1000 * (i + 1),
    settlement_bank_id: '',
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
    transaction_allocations: [
      {
        id: `txn-${i + 1}`,
        amount: 500 * (i + 1),
        currency_id: 'KHR',
        bank_ref: `bankref-${1000 + i}`,
        bank_name: 'ABA',
        tran_date: `2025-01-${String(i + 1).padStart(2, '0')} 10:00:00`
      }
    ]
  }))

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      settlements
    }
  }
})
