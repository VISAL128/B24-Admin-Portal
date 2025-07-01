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

  const confirmSettlementAPI = async (
    payload: ConfirmSettlementRequest
  ): Promise<ConfirmSettlementResponse> => {
    try {
      if (!payload.token) {
        throw new Error('Token is required for settlement confirmation')
      }
      var rep = await execute(() =>
              $fetch<ApiResponse<ConfirmSettlementResponse>>(`${baseUrl}/api/confirm-settlement`, { method: 'POST', body: payload })
            )
    
      if (rep.code !== 'SUCCESS') {
        console.error('Failed to fetch CPO settlements:', rep.message)
        throw new Error(rep.message)
      }
    } catch (error) {
      console.error('Failed to confirm settlement:', error)
      throw error
    }
    return rep.data 
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
    confirmSettlementAPI,
    getSettlementHistory
  }
}
