import { BalanceQueryRequest, CpoBalance } from '~/models/settlement'
import { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<CpoBalance[]>> => {
  const body = await readBody<BalanceQueryRequest>(event)

  const balances: CpoBalance[] = [
    { cpoId: 'CPO-001', supplierId: 'SUP-001', balance: 1200, currency: 'USD' },
    { cpoId: 'CPO-002', supplierId: 'SUP-001', balance: 900, currency: 'USD' },
    { cpoId: 'CPO-003', supplierId: 'SUP-002', balance: 1500, currency: 'USD' }
  ]

  const result = balances.filter(b =>
    (!body.supplierIds || body.supplierIds.includes(b.supplierId)) &&
    (!body.cpoIds || body.cpoIds.includes(b.cpoId))
  )

  return {
    code: 'SUCCESS',
    message: 'Fetched successfully',
    data: result
  }
})
