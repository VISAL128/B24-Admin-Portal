import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const fullEndpoint = `/transaction/list/v2`
    
    // Get Accept-Language header from the request
    const acceptLanguage = getHeader(event, 'accept-language')
    const additionalHeaders: Record<string, string> = {}
    if (acceptLanguage) {
      additionalHeaders['Accept-Language'] = acceptLanguage
    }
    
    // Use raw query params to preserve multiple Statuses and Types parameters
    const response = await requestToPgwModuleApi(
      event, 
      fullEndpoint, 
      'GET', 
      undefined, // body
      additionalHeaders, // additionalHeaders
      true // useRawQueryParams = true for transaction list
    )

    return response
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
    })
  }
})
