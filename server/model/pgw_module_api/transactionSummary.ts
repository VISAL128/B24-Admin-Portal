// Transaction Summary Types for PGW Module API

export interface CurrencyAmount {
  total_received: number
  total_settlement: number
  total_transactions: number
}

export interface PeriodSummary {
  date: string
  total_transactions: number
  khr: CurrencyAmount
  usd: CurrencyAmount
}

export interface WalletSummaryData {
  today: PeriodSummary
  week: PeriodSummary
  month: PeriodSummary
}

export interface TopUpSummaryResponse {
  code: string
  message: string
  message_kh: string
  data: {
    settlement_wallet: WalletSummaryData
  }
}

export interface FeeSummaryResponse {
  code: string
  message: string
  message_kh: string
  data: {
    settlement_wallet: WalletSummaryData
  }
}

// Combined summary data for frontend display
export interface TransactionSummaryData {
  today: {
    date: string
    totalTransactions: number
    totalReceived: number
    totalSettlement: number
    currency: string
  }
  week: {
    date: string
    totalTransactions: number
    totalReceived: number
    totalSettlement: number
    currency: string
  }
  month: {
    date: string
    totalTransactions: number
    totalReceived: number
    totalSettlement: number
    currency: string
  }
}
