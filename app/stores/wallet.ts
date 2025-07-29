import type { WalletBalanceItem } from '~~/server/model/pgw_module_api/wallet'

export interface WalletState {
  // Selected wallet information
  selectedWalletType: string
  selectedWalletTypeAPI: string
  selectedWalletData: WalletBalanceItem | null

  // Filter states for transaction history
  transactionFilter: {
    walletType: string
    transactionType: 'Wallet Top Up' | 'settlement' | 'all'
    currency: 'KHR' | 'USD' | 'all'
    dateRange: {
      from: string | null
      to: string | null
    }
    period: 'today' | 'this_week' | 'this_month' | 'custom'
  }

  // Navigation state
  lastSelectedWallet: {
    walletType: string
    currency: string
    accountNumber: string
  } | null
}

export const useWalletStore = () => {
  const state = useState<WalletState>('wallet-store', () => ({
    selectedWalletType: '',
    selectedWalletTypeAPI: '',
    selectedWalletData: null,

    transactionFilter: {
      walletType: '',
      transactionType: 'all',
      currency: 'all',
      dateRange: {
        from: null,
        to: null,
      },
      period: 'this_month',
    },

    lastSelectedWallet: null,
  }))

  // Getters
  const isTopUpWallet = computed(() => {
    return (
      state.value.selectedWalletType.toLowerCase().includes('personal') ||
      state.value.selectedWalletType.toLowerCase().includes('business') ||
      state.value.selectedWalletType.toLowerCase().includes('savings') ||
      state.value.selectedWalletType.toLowerCase().includes('investment')
    )
  })

  const isSettlementWallet = computed(() => {
    return state.value.selectedWalletType.toLowerCase().includes('settlement')
  })

  const defaultTransactionType = computed(() => {
    const walletTypeLower = state.value.selectedWalletType.toLowerCase()
    if (walletTypeLower.includes('settlement')) {
      return 'settlement' as const
    }
    return 'top_up' as const
  })

  // Get formatted filter for API calls
  const getTransactionFilters = computed(() => {
    return {
      wallet_type: state.value.transactionFilter.walletType,
      transaction_type: state.value.transactionFilter.transactionType,
      currency: state.value.transactionFilter.currency,
      date_from: state.value.transactionFilter.dateRange.from,
      date_to: state.value.transactionFilter.dateRange.to,
      period: state.value.transactionFilter.period,
    }
  })

  // Actions
  const setSelectedWalletType = (walletType: string, walletTypeAPI: string) => {
    
    console.log('Setting selected wallet type:', walletType, walletTypeAPI)
    
    state.value.selectedWalletType = walletType
    state.value.selectedWalletTypeAPI = walletTypeAPI

    // Update transaction filter based on wallet type
    state.value.transactionFilter.walletType = walletTypeAPI
    state.value.transactionFilter.transactionType = defaultTransactionType.value
  }

  // Set selected wallet data for detailed view
  const setSelectedWalletData = (walletData: WalletBalanceItem) => {
    state.value.selectedWalletData = walletData
    state.value.lastSelectedWallet = {
      walletType: state.value.selectedWalletTypeAPI,
      currency: walletData.currency,
      accountNumber: walletData.wallet_account_number,
    }
  }

  // Set transaction filters for history page
  const setTransactionFilter = (filters: Partial<WalletState['transactionFilter']>) => {
    state.value.transactionFilter = {
      ...state.value.transactionFilter,
      ...filters,
    }
  }

  // Set up filters for navigating to transaction history
  const setupTransactionHistoryFilter = (options: {
    walletType: string
    transactionType?: 'top_up' | 'settlement' | 'all'
    currency?: 'KHR' | 'USD' | 'all'
    period?: 'today' | 'this_week' | 'this_month' | 'custom'
  }) => {
    setTransactionFilter({
      walletType: options.walletType,
      transactionType: options.transactionType || defaultTransactionType.value,
      currency: options.currency || 'all',
      period: options.period || 'this_month',
    })
  }

  // Clear filters
  const clearFilters = () => {
    state.value.transactionFilter = {
      walletType: '',
      transactionType: 'all',
      currency: 'all',
      dateRange: {
        from: null,
        to: null,
      },
      period: 'this_month',
    }
  }

  // Reset store
  const resetStore = () => {
    state.value.selectedWalletType = ''
    state.value.selectedWalletTypeAPI = ''
    state.value.selectedWalletData = null
    state.value.lastSelectedWallet = null
    clearFilters()
  }

  return {
    // State
    ...toRefs(state.value),

    // Getters
    isTopUpWallet: readonly(isTopUpWallet),
    isSettlementWallet: readonly(isSettlementWallet),
    defaultTransactionType: readonly(defaultTransactionType),
    getTransactionFilters: readonly(getTransactionFilters),

    // Actions
    setSelectedWalletType,
    setSelectedWalletData,
    setTransactionFilter,
    setupTransactionHistoryFilter,
    clearFilters,
    resetStore,
  }
}
