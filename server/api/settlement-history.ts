import { defineEventHandler, readBody } from 'h3'
import { ApiResponse } from '~/models/baseModel'
import { parseISO, isAfter, isBefore } from 'date-fns'
import { SettlementHistoryQuery, SettlementHistoryRecord, SettlementHistoryResponse } from '~/models/settlement'

export default defineEventHandler(async (event): Promise<ApiResponse<SettlementHistoryResponse>> => {
  const body = await readBody<SettlementHistoryQuery>(event)

  const mockData: SettlementHistoryRecord[] = Array.from({ length: 25 }, (_, i) => {
    const suffix = i + 1
    return {
      settlement_id: `settle-000${suffix}`,
      settlement_date: `2025-01-0${suffix} 10:04:09`,
      total_supplier: 5 + i,
      total_amount: `${20000 + i * 1000}`,
      currency: 'USD',
      supplier_id: `supplier-${suffix}`,
      settled_by: 'admin',
      success: 10,
      fail: 2,
      total_Settled: 8 + i, // Added property to match SettlementHistoryRecord
      settle_details: {
        party_id: `cpo-${suffix}`,
        supplier_id: '',
        supplier: {
          id: `sup-${suffix}`,
          code: `820${suffix}`,
          name: `hong channy ${suffix}`,
          phone: 88930499,
          email: `channyheng${suffix}@gmail.com`,
          address: ''
        },
        cpo: {
          id: `cpo-${suffix}`,
          code: `792${suffix}`,
          name: `chang dara ${suffix}`,
          phone: 88930499,
          email: `changdarra${suffix}@gmail.com`,
          address: ''
        },
        settle_amount: 1200 + i * 100,
        settlement_bank_id: 'AC',
        settlement_bank_name: 'ACLEDA BANK',
        status: i % 2 === 0 ? 'success' : 'fail'
      }
    }
  })

  // Optional filtering (basic)
  const { start_date, end_date, status, page = 1, limit = 10, name } = body

  let filtered = mockData

  if (status) {
    filtered = filtered.filter(item => item.settle_details.status === status)
  }

  if (start_date) {
    filtered = filtered.filter(item =>
      isAfter(parseISO(item.settlement_date), parseISO(start_date))
    )
  }

  if (end_date) {
    filtered = filtered.filter(item =>
      isBefore(parseISO(item.settlement_date), parseISO(end_date))
    )
  }

  if (name) {
    const lower = name.toLowerCase()
    filtered = filtered.filter(item =>
      item.settle_details.cpo.name.toLowerCase().includes(lower)
    )
  }

  const paged = filtered.slice((page - 1) * limit, page * limit)

return {
    code: 'SUCCESS',
    message: 'Success',
    data: {
      page,
      limit,
      total: filtered.length,
      records: paged
    }
  }
})