import type { BaseResponse } from '~/types/api'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type { SupplierProfile } from '~/models/supplier'

export default defineEventHandler(async (event): Promise<BaseResponse<SupplierProfile[]>> => {
  try {
    const response: SupplierProfile[] = await requestToPgwModuleApi(
      event,
      PGW_MODULE_API_ENDPOINTS.PROFILE.LIST,
      'GET'
    )
    
    return {
      success: true,
      code: 'SUCCESS',
      data: response,
      message: 'Organizations retrieved successfully',
    }
  } catch (error) {
    console.error('Error fetching organizations:', error)

    // Return error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch organizations',
      data: {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    })
  }
})
