import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'
import type {
  WalletTypeResponse,
  WalletBalanceResponse,
  WalletBalanceRequest,
} from '~~/server/model/pgw_module_api/wallet'
import type {
  TopUpSummaryResponse,
  FeeSummaryResponse,
} from '~~/server/model/pgw_module_api/transactionSummary'
import type {
  WalletTransactionRequest,
  WalletTransactionResponse,
} from '~~/server/model/pgw_module_api/walletTransactions'

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

  return {
    getProfile,
    getWalletTypes,
    getWalletBalance,
    getTopUpSummary,
    getFeeSummary,
    getWalletTransactions,
  }
}
