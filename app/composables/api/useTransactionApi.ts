import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { QueryParams } from '~/models/baseModel'
import type { TransactionListResponse } from '~/models/transaction'
import type { TransactionAllocationResponse } from '~~/server/model/pgw_module_api/transactions/transaction_allocation'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transaction_summary'

export const useTransactionApi = () => {
  const { executeV2, execute } = useApiExecutor()

  /**
   * Get transaction summary from transaction API
   */
  const getTransactionSummary = async () => {
    return await executeV2(() =>
      $fetch<TransactionSummaryModel>(`/api/pgw-module/transaction/summary`, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  

  /**
   * Get paginated transaction list from transaction API
   */
  const getTransactionList = async (query?: QueryParams) => {
    console.log('Fetching transactions with query:', query)
    const rep = await executeV2(() =>
      $fetch<TransactionListResponse>(`/api/pgw-module/transaction/list/v2`, {
        method: 'GET',
        query
      })
    )
    return rep
  }




  

  /**
   * Get transaction details by ID
   */
  const getTransactionById = async (id: string) => {
    // return await executeV2(() =>
    //   $fetch(`/api/pgw-module/transaction/${id}/v2`, {
    //     method: 'GET',
    //   })
    // )
  }

  /**
   * Get transaction allocation list
   */
  const getTransactionAllocationList = async (id: string) => {
    return await executeV2(() => 
      $fetch<TransactionAllocationResponse>(`/api/transaction/${id}/allocations`)
    )
  }


  return {
    getTransactionSummary,
    getTransactionList,
    getTransactionById,
    getTransactionAllocationList
  }
}
