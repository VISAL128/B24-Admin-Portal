import type { ApiResponseList } from '~/models/baseModel'
import type { SupplierListQuery } from '~/models/supplier'
import { getListSupplier } from '~~/server/logic/management_api_logic'

export default defineEventHandler(async (): Promise<ApiResponseList<SupplierListQuery>> => {
  const response = await getListSupplier()
  // Do NOT call .json() again here!
  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response,
  }
})
