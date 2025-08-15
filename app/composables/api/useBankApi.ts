import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type {
  Bank,
  BankAccount,
  BankDetailsResponse,
  BankListResponse,
} from '~/models/bank'
import type { ApiResponse, QueryParams } from '~/models/baseModel'

export const useBankApi = () => {
  const { execute } = useApiExecutor()

  /**
   * Get list of banks with optional filtering and pagination (Legacy endpoint)
   */
  const getBanks = async (query?: QueryParams): Promise<ApiResponse<Bank[]>> => {
    const response = await execute<Bank[]>(() =>
      $fetch<ApiResponse<Bank[]>>('/api/pgw-module/bank/list', {
        method: 'GET',
        query,
      })
    )
    if (response.code !== 'SUCCESS') {
      return {
        code: 'ERROR',
        message: 'Failed to retrieve banks',
        data: [],
        total_records: 0,
        total_pages: 0,
        page: 1,
        page_size: 25,
      }
    }
    return response
  }

  /**
   * Get TBanks from real API (http://172.16.81.141:22043/bank/list)
   */
  const getTBanks = async (query?: QueryParams): Promise<ApiResponse<Bank[]>> => {
    const response = await execute<Bank[]>(() =>
      $fetch<ApiResponse<Bank[]>>('/api/pgw-module/bank/tbanks', {
        method: 'GET',
        query,
      })
    )
    if (response.code !== 'SUCCESS') {
      return {
        code: 'ERROR',
        message: 'Failed to retrieve TBanks',
        data: [],
        total_records: 0,
        total_pages: 0,
        page: 1,
        page_size: 25,
      }
    }
    return response
  }

  /**
   * Get banks by service ID from PGW Module API (Direct API call)
        total_page: 0,
        current_page: 1,
        page_size: 25,
      }
    }
    return response.data
  }

  /**
   * Get banks by service ID from PGW Module API (Direct API call)
   */
  const getBanksByServiceId = async (serviceId: string) => {
    try {
      const response = await $fetch(`/api/pgw-module/bank/service/${serviceId}`)
      return response
    } catch (error) {
      console.error('Error fetching banks by service ID:', error)
      throw error
    }
  }

  /**
   * Get banks with filtering and pagination from PGW Module API
   */
  const getBanksFromPgwModule = async (params: {
    service_id: string
    search?: string
    _page?: number
    _page_size?: number
    is_settlement_bank?: boolean
    is_collection_bank?: boolean
    currency?: string
  }) => {
    const response = await execute<BankListResponse>(() => {
      const query = new URLSearchParams()
      
      // Required parameter
      query.append('service_id', params.service_id)
      
      // Optional parameters
      if (params.search) query.append('search', params.search)
      if (params._page) query.append('_page', params._page.toString())
      if (params._page_size) query.append('_page_size', params._page_size.toString())
      if (params.is_settlement_bank !== undefined) {
        query.append('is_settlement_bank', params.is_settlement_bank.toString())
      }
      if (params.is_collection_bank !== undefined) {
        query.append('is_collection_bank', params.is_collection_bank.toString())
      }
      if (params.currency) query.append('currency', params.currency)

      return $fetch<ApiResponse<BankListResponse>>(`/api/pgw-module/bank/list?${query.toString()}`)
    })

    if (response.code !== 'SUCCESS') {
      return {
        records: [],
        total_record: 0,
        total_page: 0,
        current_page: 1,
        page_size: 25,
      }
    }
    return response.data
  }

  /**
   * Get a specific bank by ID
   */
  const getBankById = async (id: string): Promise<BankDetailsResponse | null> => {
    const response = await execute<BankDetailsResponse>(() =>
      $fetch<ApiResponse<BankDetailsResponse>>(`/api/pgw-module/bank/${id}`, {
        method: 'GET',
      })
    )

    if (response.code !== 'SUCCESS') {
      return null
    }
    return response.data
  }

  /**
   * Get accounts by supplier bank service id
   */
  const getAccountsBySupplierBankServiceId = async (sbs_id: string): Promise<BankAccount[]> => {
    try {
      const response = await execute<BankAccount[]>(() =>
      $fetch<ApiResponse<BankAccount[]>>(`/api/pgw-module/bank/${sbs_id}/accounts`, {
        method: 'GET',
      })
    )

    if (response.code !== 'SUCCESS') {
      return []
    }
    return response.data
  } catch (error) {
    if (import.meta.env.MODE === 'development') console.error('Error fetching accounts by supplier bank service ID:', error)
    return []
  }
}

  /**
   * Delete a bank
   */
  const deleteBank = async (id: string): Promise<boolean> => {
    const response = await execute<Record<string, never>>(() =>
      $fetch<ApiResponse<Record<string, never>>>(`/api/management/banks/${id}`, {
        method: 'DELETE',
      })
    )

    return response.code === 'SUCCESS'
  }

  /**
   * Toggle bank active status
   */
  const toggleBankStatus = async (id: string, isActive: boolean): Promise<Bank | null> => {
    const response = await execute<Bank>(() =>
      $fetch<ApiResponse<Bank>>(`/api/management/banks/${id}/status`, {
        method: 'PATCH',
        body: { is_active: isActive },
      })
    )

    if (response.code !== 'SUCCESS') {
      return null
    }
    return response.data
  }

  /**
   * Get banks that can be used for settlement
   */
  const getSettlementBanks = async (): Promise<Bank[]> => {
    const response = await execute<Bank[]>(() =>
      $fetch<ApiResponse<Bank[]>>('/api/management/banks/settlement', {
        method: 'GET',
      })
    )

    if (response.code !== 'SUCCESS') {
      return []
    }
    return response.data
  }

  /**
   * Get banks that can be used for collection
   */
  const getCollectionBanks = async (): Promise<Bank[]> => {
    const response = await execute<Bank[]>(() =>
      $fetch<ApiResponse<Bank[]>>('/api/management/banks/collection', {
        method: 'GET',
      })
    )

    if (response.code !== 'SUCCESS') {
      return []
    }
    return response.data
  }

  return {
    getBanks,
    getTBanks,
    getBanksByServiceId,
    getBanksFromPgwModule,
    getBankById,
    deleteBank,
    toggleBankStatus,
    getSettlementBanks,
    getCollectionBanks,
    getAccountsBySupplierBankServiceId
  }
}
