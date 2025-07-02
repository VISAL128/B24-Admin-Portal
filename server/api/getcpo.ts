import { defineEventHandler, readBody } from 'h3'
import type { Cpo, CpoBySupplierRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { getCPOsBySuppliers } from '../logic/management_api_logic';

// export default defineEventHandler(async (event): Promise<ApiResponse<Cpo[]>> => {
//   const body = await readBody<CpoBySupplierRequest>(event);

//       let response = await getCPOsBySuppliers(body);
//       return {
//           code: 'SUCCESS',
//           message: 'Success',
//           data: response.data as Cpo[]
//       };
// })



export default defineEventHandler(async (event): Promise<ApiResponse<any[]>> => {
  const body = await readBody<CpoBySupplierRequest>(event)

  const mockData = Array.from({ length: 25 }, (_, i) => {
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

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: mockData
  }
})
