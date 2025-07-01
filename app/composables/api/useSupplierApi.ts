import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type {
  Supplier, Cpo, CpoBySupplierRequest, CpoBalance,
  BalanceQueryRequest,
  ConfirmSettlementRequest, ConfirmSettlementResponse,
  SettlementHistoryQuery, SettlementHistoryResponse,
  InitQuerySettlement,
  CpoSettlement
} from '~/models/settlement'
// import type { TransactionHistory } from '~/models/transactionHistory'
import type { ApiResponse } from '~/models/baseModel'

const baseUrl = ''//'http://localhost:3005'

export const useSupplierApi = () => {
  const { execute } = useApiExecutor()

  const getSuppliers = async (): Promise<Supplier[]> => {
    var rep = await execute(() =>
      $fetch<ApiResponse<Supplier[]>>('/api/suppliers')
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch suppliers:', rep.message)
      return []
    }
    return rep.data
  }

  const getListCPOApi = async (
    payload: CpoBySupplierRequest
  ): Promise<Cpo[]> => {
    var rep = await execute(() =>
      $fetch<ApiResponse<Cpo[]>>(`${baseUrl}/api/getcpo`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch CPOs:', rep.message)
      return []
    }
    return rep.data
  }

  const getInquirySettlement = async (
    payload: InitQuerySettlement
  ): Promise<CpoSettlement> => {
    var rep = await execute(() =>
      $fetch<ApiResponse<CpoSettlement>>(`${baseUrl}/api/balance`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch CPO settlements:', rep.message)
     return null as any
    }
    return rep.data 
  }

  // const getTransactionHistory = async (
  //   cpoId: string
  // ): Promise<TransactionHistory[]> => {
  //   var rep = await execute(() =>
  //     $fetch<ApiResponse<TransactionHistory[]>>(`${baseUrl}/api/transaction-logs/${cpoId}`)
  //   )
  //   if (rep.code !== 'SUCCESS') { 
  //     console.error('Failed to fetch transaction history:', rep.message)
  //     return []
  //   }
  //   return rep.data
  // }

  const confirmSettlement = async (
    payload: ConfirmSettlementRequest
  ): Promise<ApiResponse<ConfirmSettlementResponse>> => {
    return await execute(() =>
      $fetch(`${baseUrl}/api/confirm-settlement`, { method: 'POST', body: payload })
    )
  }

  const getSettlementHistory = async (
    payload: SettlementHistoryQuery
  ): Promise<SettlementHistoryResponse> => {
    var rep = await execute(() =>
      $fetch(`${baseUrl}/api/settlement-history`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch settlement history:', rep.message)
      return null as any
    }
    return rep.data
  }

  return {
    getSuppliers,
    getListCPOApi,
    getInquirySettlement,
    // getTransactionHistory,
    confirmSettlement,
    getSettlementHistory
  }
}
