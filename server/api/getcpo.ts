import { defineEventHandler, readBody } from 'h3'
import type { CpoBySupplierRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any[]>> => {
  const body = await readBody<CpoBySupplierRequest>(event)

  const mockData = Array.from({ length: 5 }, (_, i) => {
    const id = `cpo-id-${i + 1}`
    const supplierId = `supplier-${i + 1}`

    const base = {
      id,
      code: `CPO-${7900 + i}`,
      name: `CPO ${String.fromCharCode(65 + i)}`,
      phone: 88930490 + i,
      email: `cpo${i + 1}@example.com`,
      address: '',
      supplier_id: supplierId,
      supplier: {
        id: supplierId,
        code: `SUP-${8900 + i}`,
        name: `Supplier ${String.fromCharCode(65 + i)}`,
        phone: 88930500 + i,
        email: `supplier${i + 1}@example.com`,
        address: ''
      }
    }

    return base
  })

  // const filtered = body.supplier_ids
  //   ? mockData.filter(item => body.supplier_ids.includes(item.supplier_id))
  //   : mockData

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: mockData
  }
})
