// import type { ApiResponse, QueryParams } from '~/models/baseModel'
// import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
// import type { TransactionListResponse } from '~~/server/model/pgw_module_api/transactions/transaction'

// /**
//  * Get paginated transaction list from PGW Module API
//  * 
//  * @route GET /api/pgw-module/transaction/list
//  */
// export default defineEventHandler(async (event): Promise<ApiResponse<TransactionListResponse | null>> => {
//   try {
//     const query = getQuery(event) as QueryParams
    
//     // Build query parameters for the external API
//     const queryParams = new URLSearchParams()
    
//     // Add pagination parameters
//     if (query.page !== undefined) queryParams.append('page', String(query.page))
//     if (query.page_size !== undefined) queryParams.append('page_size', String(query.page_size))
    
//     // Add filter parameters
//     if (query.search) queryParams.append('search', String(query.search))
//     if (query.status) queryParams.append('status', String(query.status))
//     if (query.transaction_type) queryParams.append('transaction_type', String(query.transaction_type))
//     if (query.date_from) queryParams.append('date_from', String(query.date_from))
//     if (query.date_to) queryParams.append('date_to', String(query.date_to))
//     if (query.bank_reference) queryParams.append('bank_reference', String(query.bank_reference))
//     if (query.supplier_id) queryParams.append('supplier_id', String(query.supplier_id))
//     if (query.sub_supplier_id) queryParams.append('sub_supplier_id', String(query.sub_supplier_id))
    
//     // Add sorting parameters
//     if (query.sort_by) queryParams.append('sort_by', String(query.sort_by))
//     if (query.sort_order) queryParams.append('sort_order', String(query.sort_order))
    
//     const queryString = queryParams.toString()
//     const endpoint = `/transaction/list/v2${queryString ? `?${queryString}` : ''}`
    
//     console.log('🔄 Fetching transaction list from:', endpoint)
    
//     const response = await requestToPgwModuleApi(
//       event,
//       endpoint,
//       'GET'
//     ) as ApiResponse<TransactionListResponse>
    
//     console.log('✅ Transaction list response received:', response?.param?.rowCount || 0, 'records')
    
//     return response
//   } catch (error: any) {
//     console.error('❌ Error fetching transaction list:', error)
    
//     // Extract error details from the API response
//     const statusCode = error?.statusCode || 500
//     const apiMessage = error?.statusMessage || error?.message || 'Unknown error occurred'
    
//     // Properly throw the error so the client can handle it
//     throw createError({
//       statusCode,
//       statusMessage: apiMessage,
//       data: {
//         showNotification: true,
//         notificationType: 'error',
//         title: 'Transaction List Error',
//         description: apiMessage,
//       },
//     })
//   }
// })
