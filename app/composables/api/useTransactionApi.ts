import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { TransactionQueryParams } from '~/models/baseModel'
import type { TransactionHistoryRecord, TransactionListResponse } from '~/models/transaction'
import type { TransactionAllocationDetail, TransactionAllocationResponse } from '~~/server/model/pgw_module_api/transactions/transaction_allocation'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transaction_summary'

export const useTransactionApi = () => {
  const { executeV2, execute } = useApiExecutor()

  /**
   * Get transaction summary from transaction API
   */
  const getTransactionSummary = async (
    query?: { FromDate?: string; ToDate?: string; PeriodType?: number },
    locale?: string
  ) => {
    const headers: Record<string, string> = {}
    
    // Map locale to Accept-Language header
    if (locale) {
      // Convert 'km' to 'km-KH' and 'en' to 'en-US' format
      const acceptLanguage = locale === 'km' ? 'km-KH' : locale === 'en' ? 'en-US' : locale
      headers['Accept-Language'] = acceptLanguage
    }

    return await executeV2(() =>
      $fetch<TransactionSummaryModel>(`/api/pgw-module/transaction/summary`, {
        method: 'GET',
        query,
        headers,
        onResponseError() {},
      })
    )
  }


  /**
   * Get paginated transaction list from transaction API
   */
  const getTransactionList = async (query?: TransactionQueryParams, locale?: string) => {
   
    console.log('Fetching transactions with query:', query)
    
    const headers: Record<string, string> = {}
    
    // Map locale to Accept-Language header
    if (locale) {
      // Convert 'km' to 'km-KH' and 'en' to 'en-US' format
      const acceptLanguage = locale === 'km' ? 'km-KH' : locale === 'en' ? 'en-US' : locale
      headers['Accept-Language'] = acceptLanguage
    }

    // Format the query parameters for Transaction API v2
    let formattedQuery: any = { ...query }
    
    // Map client-side parameters to API-specific parameters
    if (query?.statuses && Array.isArray(query.statuses) && query.statuses.length > 0) {
      // Remove the client-side statuses and replace with API-expected Statuses
      delete formattedQuery.statuses
      formattedQuery.Statuses = query.statuses
    }
    
    // Types parameter is already in the correct format for the API
    // No mapping needed - just ensure it's properly formatted
    if (query?.Types && Array.isArray(query.Types) && query.Types.length > 0) {
      formattedQuery.Types = query.Types
    }
    

    
    console.log('Final formatted query for transaction API:', formattedQuery)
    
    const rep = await executeV2(() =>
      $fetch<TransactionListResponse>(`/api/pgw-module/transaction/list/v2`, {
        method: 'GET',
        query: formattedQuery,
        headers
      })
    )
    return rep
  }

  /**
   * Get transaction details by ID
   */
  const getTransactionById = async (id: string) => {
      return await executeV2(() =>
        $fetch<TransactionHistoryRecord>(`/api/pgw-module/transaction/${id}/v2`, {
          method: 'GET',
          onResponseError() {},
        })
      )
    }

  /**
   * Get transaction allocation list
   */
  const getTransactionAllocationList = async (id: string) => {
    return await executeV2(() => 
      $fetch<TransactionAllocationResponse>(`/api/pgw-module/transaction/${id}/allocations`)
    )
  }

  /**
   * Get transaction allocation detail
   */
  const getAllocationDetail = async (transactionId: string, allocationId: string) => {
    return await executeV2(() =>
      $fetch<TransactionAllocationDetail>(`/api/pgw-module/transaction/${transactionId}/allocations/${allocationId}`)
    )
  }


  return {
    getTransactionSummary,
    getTransactionList,
    getTransactionById,
    getTransactionAllocationList,
    getAllocationDetail
  }
}
