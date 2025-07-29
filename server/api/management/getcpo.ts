import { defineEventHandler, readBody } from 'h3'
import type { Cpo, CpoBySupplierRequest } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { getCPOsBySuppliers } from '../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<Cpo[]>> => {
  const body = await readBody<CpoBySupplierRequest>(event)

  const response = await getCPOsBySuppliers(body)
  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response.data as Cpo[],
  }
})
