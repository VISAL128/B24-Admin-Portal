import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transactionSummary'

export const useTransactionApi = () => {
  const { executeV2 } = useApiExecutor()

  /**
   * Get transaction summary from PGW Module API
   */
  const getTransactionSummary = async () => {
    return await executeV2(() =>
      $fetch<TransactionSummaryModel>(`/api/pgw-module/transaction/summary`, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  return {
    getTransactionSummary,
  }
}
