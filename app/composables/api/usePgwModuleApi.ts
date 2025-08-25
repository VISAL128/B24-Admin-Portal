import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { SubBillerListResponse, WalletListResponse, DeactivateSubBillerReq} from '~/models/subBiller'
import type { Supplier } from '~/models/supplier'
import type { TransactionListResponse, WalletTransactionListResponse } from '~/models/transaction'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'

import type {
  FeeSummaryResponse,
  TopUpSummaryResponse,
} from '~~/server/model/pgw_module_api/wallet_transaction_summary'

import type { QueryParams } from '~/models/baseModel'
import type {
  WalletBalanceRequest,
  WalletBalanceResponse,
  WalletTypeResponse,
} from '~~/server/model/pgw_module_api/wallet'
import type {
  WalletTransactionRequest,
  WalletTransactionResponse,
} from '~~/server/model/pgw_module_api/wallet_transactions'

import type { UploadFileResponse } from '~/models/media'

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

  const getSubBillers = async (query?: QueryParams) => {
    console.log('Fetching sub billers with query:', query)
    const rep = await executeV2(() =>
      $fetch<SubBillerListResponse>(`/api/pgw-module/sub-biller/get-sub-biller`, {
        method: 'GET',
        query,
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
      $fetch<WalletListResponse>(
        `/api/pgw-module/sub-biller/get-wallet-list?subBillerSupplierId=${subBillerSupplierId}`,
        {
          method: 'GET',
          onResponseError() {},
        }
      )
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
   * Get settlement wallet transactions from PGW Module API
   */
  const getSettlementWalletTransactions = async (params?: QueryParams) => {
    console.log('Fetching settlement wallet transactions with params:', params)
    const url = `/api/pgw-module/walletmgnt/settlement/transactions`

    return await executeV2(() =>
      $fetch(url, {
        method: 'GET',
        onResponseError() {},
        query: params,
      })
    )
  }

  /**
   * Get top-up wallet transactions from PGW Module API
   */

  const getTopUpWalletTransactions = async (params?: QueryParams) => {
    const url = `/api/pgw-module/walletmgnt/top-up/transactions`
    return await executeV2(() =>
      $fetch(url, {
        method: 'GET',
        onResponseError() {},
        query: params,
      })
    )
  }
  // const getTopUpWalletTransactions = async (params?: QueryParams) => {
  //   // Convert params object to URLSearchParams
  //   const urlParams = new URLSearchParams()
  //   if (params) {
  //     for (const [key, value] of Object.entries(params)) {
  //       if (value !== undefined && value !== null && value !== '') {
  //         urlParams.append(key, String(value))
  //       }
  //     }
  //   }

  //   const queryString = urlParams.toString()
  //   const url = `/api/pgw-module/walletmgnt/top-up/transactions${queryString ? `?${queryString}` : ''}`

  //   return await executeV2(() =>
  //     $fetch(url, {
  //       method: 'GET',
  //       onResponseError() {},
  //     })
  //   )
  // }

  const getTransactions = async (query?: QueryParams) => {
    console.log('Fetching transactions with query:', query)
    const rep = await executeV2(() =>
      $fetch<TransactionListResponse>(`/api/pgw-module/transaction/list/v2`, {
        method: 'GET',
        query,
      })
    )
    return rep
  }

  
    const deactivateSubBiller = async (request: DeactivateSubBillerReq) => {
    return await executeV2(() =>
      $fetch<WalletBalanceResponse>(`/api/pgw-module/sub-biller/deactivate`, {
        method: 'POST',
        body: request,
        onResponseError() {},
      })
    )
  }

      const updateSubBiller = async (request: Supplier) => {
    return await executeV2(() =>
      $fetch<WalletBalanceResponse>(`/api/pgw-module/sub-biller/update`, {
        method: 'POST',
        body: request,
        onResponseError() {},
      })
    )
  }

const uploadFile = async (file: File) => {
    const form = new FormData()
    form.append('file', file, file.name)

    return await executeV2(() =>
      $fetch<UploadFileResponse>(`/api/pgw-module/media/uploadfile`, {
        method: 'POST',
        body: form,
        onResponseError() {},
      })
    )
  }

  const getWalletTransactionBySubBiller = async (query?: QueryParams) => {
    console.log('Fetching transactions with query:', query)
    const rep = await executeV2(() =>
      $fetch<WalletTransactionListResponse>(`/api/pgw-module/reports/get-transaction-wallet-payments`, {
        method: 'GET',
        query,
      })
    )
    return rep
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
    getSubBillerWalletList,
    getTransactions,
    deactivateSubBiller,
    updateSubBiller,
    uploadFile,
    getWalletTransactionBySubBiller
  }
}
