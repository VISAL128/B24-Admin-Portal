import { defineEventHandler, readBody } from 'h3'
import type { Cpo, CpoBySupplierRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (): Promise<ApiResponse<Cpo[]>> => {
  const plist: Cpo[] = Array.from({ length: 25 }, (_, i) => ({
    id: `e4b96b38-5ccf-4365-b3ce-67b9dacf1d0${i}`,
    code: `${7929 + i}`,
    name: `chang dara ${i + 1}`,
    phone: 88930499 + i,
    email: `changdarra${i + 1}@gmail.com`,
    address: '',
    supplier_id: `supplier-id-${i}`,
    supplier: {
      id: `supplier-id-${i}`,
      name: `Supplier ${i + 1}`,
      code: `SUP${1000 + i}`,
      phone: 88000000 + i,
      email: `supplier${i + 1}@gmail.com`,
      address: `Supplier Address ${i + 1}`
    }
  }))

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: plist
  }
})