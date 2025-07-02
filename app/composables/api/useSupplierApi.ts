import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type {
  Supplier, Cpo, CpoBySupplierRequest,
  ConfirmSettlementRequest, ConfirmSettlementResponse,
  SettlementHistoryQuery, SettlementHistoryResponse,
  SettlementHistoryRecord,
  InitQuerySettlement,
  SettlementInquiryResponse
} from '~/models/settlement'
// import type { TransactionHistory } from '~/models/transactionHistory'
import type { ApiResponse } from '~/models/baseModel'

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
      $fetch<ApiResponse<Cpo[]>>(`/api/getcpo`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch CPOs:', rep.message)
      return []
    }
    return rep.data
  }

  const getInquirySettlement = async (
    payload: InitQuerySettlement
  ): Promise<SettlementInquiryResponse> => {
    var rep = await execute(() =>
      $fetch<ApiResponse<SettlementInquiryResponse>>(`/api/inquiry-settlement`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch CPO settlements:', rep.message)
     return null as any
    }
    return rep.data 
  }

  const confirmSettlementAPI = async (
    payload: ConfirmSettlementRequest
  ): Promise<{data?: ConfirmSettlementResponse; error?: string}> => {
    try {
      if (!payload.settlement_token) {
        throw new Error('Token is required for settlement confirmation')
      }
      var rep = await execute(() =>
              $fetch<ApiResponse<ConfirmSettlementResponse>>(`/api/submit-settlement`, { method: 'POST', body: payload })
            )
    
      if (rep.code !== 'SUCCESS') {
        console.error('Failed to fetch CPO settlements:', rep.message)
        return { error: rep.message }
        throw new Error(rep.message)
      }
    } catch (error) {
      console.error('Failed to confirm settlement:', error)
      throw error
    }
    return { data: rep.data }
  }

  const getSettlementHistory = async (
    payload: SettlementHistoryQuery
  ): Promise<SettlementHistoryResponse> => {
    var rep = await execute(() =>
      $fetch(`/api/settlement-history`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch settlement history:', rep.message)
      return null as any
    }
    return rep.data
  }

  const getSettlementHistoryById = async (
    id: string
  ): Promise<SettlementHistoryRecord> => {
    var rep = await execute(() =>
      $fetch<ApiResponse<SettlementHistoryRecord>>(`/api/findsettlementhistory/${id}`)
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch settlement history by ID:', rep.message)
      throw new Error(rep.message || 'Failed to fetch settlement history detail')
    }
    return rep.data
  }

  return {
    getSuppliers,
    getListCPOApi,
    getInquirySettlement,
    // getTransactionHistory,
    confirmSettlementAPI,
    getSettlementHistory,
    getSettlementHistoryById
  }

}



