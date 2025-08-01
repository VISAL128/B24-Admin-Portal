import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    // Get service ID from route parameters
    const serviceId = getRouterParam(event, 'serviceId')
    
    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Service ID is required',
        data: {
          code: 'VALIDATION_ERROR',
          message: 'serviceId parameter is required',
          data: null,
        },
      })
    }

    // Call the PGW Module API
    const endpoint = `/get-current-bank-by-service-id/${serviceId}`
    const response = await requestToPgwModuleApi(event, endpoint, 'GET')

    // Return the response as-is from the PGW Module API
    return response
  } catch (error) {
    console.error('Error in get banks by service ID API:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to retrieve banks by service ID',
        data: null,
      },
    })
  }
})
