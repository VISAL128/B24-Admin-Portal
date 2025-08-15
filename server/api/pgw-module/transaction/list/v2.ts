import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    // Get Accept-Language header from the request
    const acceptLanguage = getHeader(event, 'accept-language')
    const additionalHeaders: Record<string, string> = {}
    if (acceptLanguage) {
      additionalHeaders['Accept-Language'] = acceptLanguage
    }
    
    // Use raw query params to preserve multiple Statuses and Types parameters
    const response = await requestToPgwModuleApi(
      event, 
      PGW_MODULE_API_ENDPOINTS.TRANSACTION.GET_TRANSACTION_LIST, 
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
