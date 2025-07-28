import { defineEventHandler } from 'h3'
import type { SharingSupplier } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { RESPONSE_HTTP_CODE } from '~/utils/constants'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
// import { findFeeConfigById } from '../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<SharingSupplier[] | []>> => {
  try {
    const response = (await requestToPgwModuleApi(
      event,
      `/get_allocate_default`,
      'GET'
    )) as ApiResponse<SharingSupplier[] | []>

    if (!response || response.code !== RESPONSE_HTTP_CODE.SUCCESS) {
      return {
        code: 'ERROR',
        message: response.message,
        data: [],
      }
    }
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as SharingSupplier[],
    }
  } catch (error) {
    console.error('Error fetching fee config :', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }
})
