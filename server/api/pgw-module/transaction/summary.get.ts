import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    // Use the same pattern as transaction list API for consistency
    // The PGW module logic will automatically handle pagination and parameter formatting
    const endpoint = '/transaction/summary'

    console.log('📊 Transaction Summary API - using automatic parameter processing like transaction list')

    // Get Accept-Language header from the client request
    const acceptLanguage = getHeader(event, 'accept-language')
    const headers: Record<string, string> = {}
    
    // Forward Accept-Language header if provided
    if (acceptLanguage) {
      headers['Accept-Language'] = acceptLanguage
    }

    // Use the same approach as transaction list API with useRawQueryParams
    const response = await requestToPgwModuleApi(
      event,
      endpoint,
      'GET',
      undefined,
      headers,
      true // useRawQueryParams - same as transaction list
    )
    return response
  } catch (error: any) {
    console.error('❌ Error fetching transaction summary:', error)

    const statusCode = error?.statusCode || 500
    const apiMessage = error?.statusMessage || error?.message || 'Unknown error occurred'

    throw createError({
      statusCode,
      statusMessage: apiMessage,
      data: {
        showNotification: true,
        notificationType: 'error',
        title: 'Transaction Summary Error',
        description: apiMessage,
      },
    })
  }
})
