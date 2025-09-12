import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type {
  Supplier,
  Cpo,
  CpoBySupplierRequest,
  ConfirmSettlementRequest,
  ConfirmSettlementResponse,
  SettlementHistoryQuery,
  SettlementHistoryResponse,
  InitQuerySettlement,
  SettlementInquiryResponse,
  SettlementHistoryDetailQuery,
  SettlementHistoryDetailResponse,
} from '~/models/settlement'
// import type { TransactionHistory } from '~/models/transactionHistory'
import type { ApiResponseList, QueryParams } from '~/models/baseModel'
import type { SupplierListQuery } from '~/models/supplier'

export const useSupplierApi = () => {
  const { execute } = useApiExecutor()
  const { locale } = useI18n()

  const getSuppliers = async (): Promise<Supplier[]> => {
    const rep = await execute(() =>
      $fetch<ApiResponseList<Supplier[]>>('/api/management/suppliers')
    )
    if (rep.code !== 'SUCCESS') {
      return []
    }
    return rep.data
  }

  const getListCPOApi = async (payload: CpoBySupplierRequest): Promise<Cpo[]> => {
    const rep = await execute(() =>
      $fetch<ApiResponseList<Cpo[]>>(`/api/management/getcpo`, { method: 'POST', body: payload })
    )
    if (rep.code !== 'SUCCESS') {
      return []
    }
    return rep.data
  }

  const getInquirySettlement = async (
    payload: InitQuerySettlement
  ): Promise<SettlementInquiryResponse | null> => {
    const rep = await execute(() =>
      $fetch<ApiResponseList<SettlementInquiryResponse>>(`/api/management/inquiry-settlement`, {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      return null
    }
    return rep.data
  }

  const confirmSettlementAPI = async (
    payload: ConfirmSettlementRequest
  ): Promise<{ data?: ConfirmSettlementResponse; error?: string }> => {
    try {
      if (!payload.settlement_token) {
        throw new Error('Token is required for settlement confirmation')
      }
      const rep = await execute(() =>
        $fetch<ApiResponseList<ConfirmSettlementResponse>>(`/api/management/submit-settlement`, {
          method: 'POST',
          body: payload,
        })
      )

      if (rep.code !== 'SUCCESS') {
        return { error: rep.message }
      }
      return { data: rep.data }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error during settlement confirmation'
      )
    }
  }

  const getSettlementHistory = async (
    payload: SettlementHistoryQuery
  ): Promise<SettlementHistoryResponse | null> => {
    payload.supplier_id = useAuth().currentProfile.value?.id || ''
    const rep = await execute(() =>
      $fetch<ApiResponseList<SettlementHistoryResponse>>('/api/management/settlement-history', {
        method: 'POST',
        body: payload,
      })
    )
    if (rep.code !== 'SUCCESS') {
      console.error('Failed to fetch settlement history:', rep.message)
      return null
    }
    return rep.data
  }

  const getSettlementHistoryById = async (
    payload: SettlementHistoryDetailQuery
  ): Promise<SettlementHistoryDetailResponse> => {
    const rep = await execute(
      () =>
        $fetch<ApiResponseList<SettlementHistoryDetailResponse>>(
          `/api/management/find-settlement-history-detail`,
          {
            method: 'POST',
            body: payload,
          }
        ),
      false
    )
    if (rep.code !== 'SUCCESS') {
      throw new Error(rep.message || 'Failed to fetch settlement history detail')
    }
    if (!rep.data || !rep.data.records) {
      throw new Error(
        locale.value === 'km'
          ? rep.message_kh || ''
          : rep.message || 'No settlement history details found'
      )
    }
    return rep.data
  }

  const getSupplierList = async (
    query?: QueryParams
  ): Promise<ApiResponseList<SupplierListQuery>> => {
    const response = await execute<SupplierListQuery>(() =>
      $fetch<ApiResponseList<SupplierListQuery>>('/api/management/suppliers', {
        method: 'GET',
        query,
      })
    )
    console.log('Bank list response:', response)

    return response
  }

  return {
    getSuppliers,
    getListCPOApi,
    getInquirySettlement,
    // getTransactionHistory,
    confirmSettlementAPI,
    getSettlementHistory,
    getSettlementHistoryById,
    getSupplierList,
  }
}
