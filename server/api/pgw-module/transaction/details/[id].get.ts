import type { ApiResponseList } from '~/models/baseModel'
import type { TransactionHistoryRecord } from '~~/app/models/transaction'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'

/**
 * Get transaction details by ID from PGW Module API (v2)
 *
 * @route GET /api/pgw-module/transaction/[id]/v2
 */
export default defineEventHandler(
  async (event): Promise<ApiResponseList<TransactionHistoryRecord | null>> => {
    try {
      const id = getRouterParam(event, 'id')

      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Transaction ID is required',
        })
      }

      console.log(`🔍 Fetching transaction details for ID: ${id}`)

      // Use the endpoint from configuration with parameter replacement
      const endpoint = PGW_MODULE_API_ENDPOINTS.TRANSACTION.GET_BY_ID.replace('{id}', id)

      const response = (await requestToPgwModuleApi(
        event,
        endpoint,
        'GET'
      )) as ApiResponseList<TransactionHistoryRecord>

      console.log(`✅ Transaction details fetched successfully for ID: ${id}`)

      return response
    } catch (error: any) {
      console.error('❌ Error fetching Transaction by ID:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch Transaction by ID',
      })
    }
  }
)
