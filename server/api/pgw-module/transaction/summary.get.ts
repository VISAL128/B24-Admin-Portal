import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = (await requestToPgwModuleApi(
      event,
      '/transaction/summary',
      'GET'
    )) 
    return response
  } catch (error: any) {
    console.error('❌ Error fetching transaction summary:', error)
    
    // Extract error details from the API response
    const statusCode = error?.statusCode || 500
    const apiMessage = error?.statusMessage || error?.message || 'Unknown error occurred'
    
    // Properly throw the error so the client can handle it
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
