import { requestToMtcApi } from '../../logic/mtc_api_logic'
import { mtcApiEndpoints } from '../../utils/mtc-api-endpoints'
import type { ModuleResponse, TenantAccess } from '../../model/mtc_api/module'
import type { BaseResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<BaseResponse<TenantAccess[]>> => {
  try {
    // Get the module code from runtime config
    const runtimeConfig = useRuntimeConfig()
    const moduleCode = runtimeConfig.moduleCode

    // Make request to MTC API to get module by code (which contains organization data)
    const response: ModuleResponse = await requestToMtcApi(
      event,
      mtcApiEndpoints.getModuleByCode(moduleCode),
      'GET'
    )

    console.log('MTC API Module Response:', response)
    // Return the organization data from the module response
    return {
      success: true,
      code: 'SUCCESS',
      data: response.canAccessByTenants,
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
