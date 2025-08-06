import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { SubBillerListResponse, SubBillerQuery, WalletListResponse } from '~/models/subBiller'
import type { Supplier } from '~/models/supplier'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'
import type { TransactionSummaryModel } from '~~/server/model/pgw_module_api/transactions/transactionSummary'
import type {
  FeeSummaryResponse,
  TopUpSummaryResponse,
} from '~~/server/model/pgw_module_api/wallet_transaction_summary'

import type {
  WalletBalanceRequest,
  WalletBalanceResponse,
  WalletTypeResponse,
} from '~~/server/model/pgw_module_api/wallet'
import type {
  WalletTransactionRequest,
  WalletTransactionResponse,
} from '~~/server/model/pgw_module_api/wallet_transactions'

export const usePgwModuleApi = () => {
  const { executeV2 } = useApiExecutor()

  /**
   * Get current user profile from PGW Module API
   */
  const getProfile = async () => {
    return await executeV2(() =>
      $fetch<PgwModuleProfile>(`/api/pgw-module/get-profile`, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  /**
   * Get wallet types from PGW Module API
   */
  const getWalletTypes = async () => {
    return await executeV2(() =>
      $fetch<WalletTypeResponse>(`/api/pgw-module/walletmgnt/get-wallet-type`, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  /**
   * Get wallet balance information from PGW Module API
   */
  const getWalletBalance = async (request: WalletBalanceRequest) => {
    return await executeV2(() =>
      $fetch<WalletBalanceResponse>(`/api/pgw-module/walletmgnt/wallet-info`, {
        method: 'POST',
        body: request,
        onResponseError() {},
      })
    )
  }

  /**
   * Get top-up summary transactions from PGW Module API
   */
  const getTopUpSummary = async (currency?: string) => {
    const params = currency ? `?currency=${currency}` : ''
    return await executeV2(() =>
      $fetch<TopUpSummaryResponse>(
        `/api/pgw-module/walletmgnt/get-top-up-summary-transactions${params}`,
        {
          method: 'GET',
          onResponseError() {},
        }
      )
    )
  }

  /**
   * Get fee (settlement) summary transactions from PGW Module API
   */
  const getFeeSummary = async (currency?: string) => {
    const params = currency ? `?currency=${currency}` : ''
    return await executeV2(() =>
      $fetch<FeeSummaryResponse>(
        `/api/pgw-module/walletmgnt/get-fee-summary-transactions${params}`,
        {
          method: 'GET',
          onResponseError() {},
        }
      )
    )
  }

  const getSubBillers = async (payload: SubBillerQuery) => {
    const query = new URLSearchParams(
      Object.entries(payload).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) acc[key] = String(value)
          return acc
        },
        {} as Record<string, string>
      )
    ).toString()
    console.log('Fetching sub billers with query:', query)
    const rep = await executeV2(() =>
      $fetch<SubBillerListResponse>(`/api/pgw-module/sub-biller/get-sub-biller?${query}`, {
        method: 'GET',
      })
    )
    return rep
  }

  /**
 * Get a specific sub biller by ID from PGW Module API
 */
const getSubBillerById = async (id: string) => {
  return await executeV2(() =>
    $fetch<Supplier>(`/api/pgw-module/sub-biller/${id}`, {
      method: 'GET',
      onResponseError() {},
    })
  )
}

const getSubBillerWalletList = async (subBillerSupplierId: string) => {
  return await executeV2(() =>
    $fetch<WalletListResponse>(`/api/pgw-module/sub-biller/get-wallet-list?subBillerSupplierId=${subBillerSupplierId}`, {
      method: 'GET',
      onResponseError() {},
    })
  )
}

  /**
   * Get wallet transactions with pagination from PGW Module API
   */
  const getWalletTransactions = async (request: WalletTransactionRequest) => {
    return await executeV2(() =>
      $fetch<WalletTransactionResponse>(`/api/pgw-module/walletmgnt/get-wallet-transactions`, {
        method: 'POST',
        body: request,
        onResponseError() {},
      })
    )
  }

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

  /**
   * Get settlement wallet transactions from PGW Module API
   */
  const getSettlementWalletTransactions = async (params?: Record<string, string | number | boolean>) => {
    // Convert params object to URLSearchParams
    const urlParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          urlParams.append(key, String(value))
        }
      }
    }
    
    const queryString = urlParams.toString()
    const url = `/api/pgw-module/walletmgnt/settlement/transactions${queryString ? `?${queryString}` : ''}`

    return await executeV2(() =>
      $fetch(url, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  /**
   * Get top-up wallet transactions from PGW Module API
   */
  const getTopUpWalletTransactions = async (params?: Record<string, string | number | boolean>) => {
    // Convert params object to URLSearchParams
    const urlParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          urlParams.append(key, String(value))
        }
      }
    }
    
    const queryString = urlParams.toString()
    const url = `/api/pgw-module/walletmgnt/top-up/transactions${queryString ? `?${queryString}` : ''}`

    return await executeV2(() =>
      $fetch(url, {
        method: 'GET',
        onResponseError() {},
      })
    )
  }

  return {
    getProfile,
    getWalletTypes,
    getWalletBalance,
    getTopUpSummary,
    getFeeSummary,
    getWalletTransactions,
    getSettlementWalletTransactions,
    getTopUpWalletTransactions,
    getSubBillers,
    getSubBillerById,
    getTransactionSummary,
    getSubBillerWalletList
  }
}
