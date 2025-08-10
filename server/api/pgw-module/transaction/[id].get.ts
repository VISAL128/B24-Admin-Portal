import type { ApiResponse } from '~/models/baseModel'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type { TransactionModel } from '~~/server/model/pgw_module_api/transactions/transaction'

/**
 * Get transaction details by ID from PGW Module API
 * 
 * @route GET /api/transaction/[id]
 */
export default defineEventHandler(async (event): Promise<ApiResponse<TransactionModel | null>> => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required',
        data: {
          showNotification: true,
          notificationType: 'error',
          title: 'Validation Error',
          description: 'Transaction ID is required',
        },
      })
    }
    
    const response = await requestToPgwModuleApi(
      event,
      `/transaction/${id}/v2`,
      'GET'
    ) as ApiResponse<TransactionModel>
    
    return response
  } catch (error: any) {
    console.error('❌ Error fetching transaction details:', error)
    
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
        title: 'Transaction Details Error',
        description: apiMessage,
      },
    })
  }
})
