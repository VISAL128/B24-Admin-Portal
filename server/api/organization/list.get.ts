import { requestToMtcApi } from '../../logic/mtc_api_logic'
import { mtcApiEndpoints } from '../../utils/mtc-api-endpoints'
import type { ModuleResponse, TenantAccess } from '../../model/mtc_api/module'
import type { BaseResponse } from '~~/server/model/base'

export default defineEventHandler(async (event): Promise<BaseResponse<TenantAccess[]>> => {
  try {
    // Get the module code from query parameters, default to 'pgw'
    const query = getQuery(event)
    const moduleCode = (query.moduleCode as string) || 'pgw'

    // Make request to MTC API to get module by code (which contains organization data)
    const response: ModuleResponse = await requestToMtcApi(
      event,
      mtcApiEndpoints.getModuleByCode(moduleCode),
      'GET'
    )

    // Return the organization data from the module response
    return {
      success: true,
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
