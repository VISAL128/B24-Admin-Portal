import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'
import type { Bank } from '~/models/bank'
import type { ApiResponse, PgwModuleResponseList } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<Bank[]>> => {
  try {
    // Call the PGW Module API
    const response = await requestToPgwModuleApi<PgwModuleResponseList<Bank>>(event, PGW_MODULE_API_ENDPOINTS.BANK.GET_BY_WALLET_SERVICE, 'GET', true)

    console.log('Response from PGW Module API:', response)
    const banks = response.result || []

    return {
      code: 'SUCCESS',
      message: 'Banks retrieved successfully',
      total_records: response.param.rowCount,
      total_pages: response.param.pageCount,
      page: response.param.pageIndex,
      page_size: response.param.pageSize,
      data: banks,
    }
  } catch (error) {
    console.error('Error in banks API:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to retrieve banks',
        data: null,
      },
    })
  }
})
