import { requestToMtcApi } from '../../logic/mtc_api_logic'
import { mtcApiEndpoints } from '../../utils/mtc-api-endpoints'
import type { SwitchTenantRequest, SwitchTenantResponse } from '../../model/mtc_api/module'
import type { BaseResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<BaseResponse<SwitchTenantResponse>> => {
  try {
    // Read the request body
    const body = await readBody(event)

    // Validate the request body
    if (!body || !body.toTenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'toTenantId is required',
        },
      })
    }

    const switchRequest: SwitchTenantRequest = {
      toTenantId: body.toTenantId,
    }

    // Make request to MTC API to switch tenant/organization
    const response: SwitchTenantResponse = await requestToMtcApi(
      event,
      mtcApiEndpoints.switchTenant,
      'PUT',
      switchRequest,
      'application/json-patch+json'
    )

    console.log('MTC API Switch Tenant Response:', response)

    // Return success response
    return {
      success: true,
      code: 'SUCCESS',
      data: response,
      message: 'Organization switched successfully',
    }
  } catch (error) {
    console.error('Error switching organization:', error)

    // Handle different error types
    if (error instanceof Error && error.message.includes('MTC API request failed')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to switch organization',
        data: {
          success: false,
          message: 'External API error: ' + error.message,
        },
      })
    }

    // Return generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to switch organization',
      data: {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    })
  }
})
