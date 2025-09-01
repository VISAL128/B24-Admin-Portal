import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type { TransactionAllocationResponse } from '~~/server/model/pgw_module_api/transactions/transaction_allocation'
import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'

/**
 * Get transaction allocation list by ID from PGW Module API
 * 
 * @route GET /api/pgw-module/transaction/[id]/allocations
 */
export default defineEventHandler(async (event): Promise<TransactionAllocationResponse> => {
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
      PGW_MODULE_API_ENDPOINTS.TRANSACTION.ALLOCATION_BY_ID.replace('{id}', id),
      'GET'
    ) as TransactionAllocationResponse
    
    return response
  } catch (error: any) {
    console.error('❌ Error fetching transaction allocations:', error)
    
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
        title: 'Transaction Allocations Error',
        description: apiMessage,
      },
    })
  }
})
