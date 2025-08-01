import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'
import type { Bank } from '~/models/bank'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event) => {
  try {
    // Extract query parameters
    const query = getQuery(event)
    const {
      _search = '',
      _page = 1,
      _page_size = 25,
      _is_settlement_bank,
      _is_collection_bank,
      _currency,
    } = query

    // Call the PGW Module API
    const response = await requestToPgwModuleApi(event, PGW_MODULE_API_ENDPOINTS.BANK.GET_BY_WALLET_SERVICE, 'GET')

    console.log('Response from PGW Module API:', response)
    let banks: Bank[] = []
    if (response && typeof response === 'object' && 'data' in response) {
      const responseData = response as ApiResponse<Bank[]>
      banks = responseData.data || []
    } else if (Array.isArray(response)) {
      banks = response as Bank[]
    }

    return {
      code: 'SUCCESS',
      message: 'Banks retrieved successfully',
      data: {
        records: banks,
        total_record: banks.length,
        total_page: 1,
        current_page: 1,
        page_size: banks.length,
      },
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
