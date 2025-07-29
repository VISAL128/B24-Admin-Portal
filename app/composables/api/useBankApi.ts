import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type {
  Bank,
  BankQuery,
  BankListResponse,
  CreateBankRequest,
  UpdateBankRequest,
} from '~/models/bank'
import type { ApiResponse } from '~/models/baseModel'

export const useBankApi = () => {
  const { execute } = useApiExecutor()

  /**
   * Get list of banks with optional filtering and pagination
   */
  const getBanks = async (query?: BankQuery): Promise<BankListResponse> => {
    const response = await execute<BankListResponse>(() =>
      $fetch<ApiResponse<BankListResponse>>('/api/management/banks', {
        method: 'GET',
        query,
      })
    )

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
  const getBankById = async (id: string): Promise<Bank | null> => {
    const response = await execute<Bank>(() =>
      $fetch<ApiResponse<Bank>>(`/api/management/banks/${id}`, {
        method: 'GET',
      })
    )

    if (response.code !== 'SUCCESS') {
      return null
    }
    return response.data
  }

  /**
   * Create a new bank
   */
  const createBank = async (bankData: CreateBankRequest): Promise<Bank | null> => {
    const response = await execute<Bank>(() =>
      $fetch<ApiResponse<Bank>>('/api/management/banks', {
        method: 'POST',
        body: bankData,
      })
    )

    if (response.code !== 'SUCCESS') {
      return null
    }
    return response.data
  }

  /**
   * Update an existing bank
   */
  const updateBank = async (bankData: UpdateBankRequest): Promise<Bank | null> => {
    const response = await execute<Bank>(() =>
      $fetch<ApiResponse<Bank>>(`/api/management/banks/${bankData.id}`, {
        method: 'PUT',
        body: bankData,
      })
    )

    if (response.code !== 'SUCCESS') {
      return null
    }
    return response.data
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
    getBankById,
    createBank,
    updateBank,
    deleteBank,
    toggleBankStatus,
    getSettlementBanks,
    getCollectionBanks,
  }
}
