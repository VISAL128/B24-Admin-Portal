import { Cpo, CpoBySupplierRequest } from '~/models/settlement'
import { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<Cpo[]>> => {
  const body = await readBody<CpoBySupplierRequest>(event)

  const mockData: Cpo[] = [
    { cpoId: 'CPO-001', supplierId: 'SUP-001', name: 'CPO A1' },
    { cpoId: 'CPO-002', supplierId: 'SUP-001', name: 'CPO A2' },
    { cpoId: 'CPO-003', supplierId: 'SUP-002', name: 'CPO B1' }
  ]

  const filtered = mockData.filter(cpo => body.supplierIds.includes(cpo.supplierId))

  return {
    code: 'SUCCESS',
    message: 'Fetched successfully',
    data: filtered
  }
})
