import type { Bank } from '~/models/bank'
import type { ApiResponse, PgwModuleResponseList } from '~/models/baseModel'
import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<Bank[]>> => {
  try {
    // Call the real PGW Module API for bank list
    const response = await requestToPgwModuleApi<PgwModuleResponseList<Bank>>(
      event, 
      PGW_MODULE_API_ENDPOINTS.BANK.LIST, 
      'GET'
    )
    
    const banks = response.result || []

    return {
      code: 'SUCCESS',
      message: 'TBanks retrieved successfully',
      total_records: response.param?.rowCount || banks.length,
      total_pages: response.param?.pageCount || 1,
      page: response.param?.pageIndex || 1,
      page_size: response.param?.pageSize || banks.length,
      data: banks,
    }
  } catch (error) {
    console.error('Error in TBanks API:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to retrieve TBanks',
        data: null,
      },
    })
  }
})
