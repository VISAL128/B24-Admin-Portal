// Wallet Transaction Models for PGW Module API

export interface WalletTransactionRequest {
  wallet_id: string
  page: number
  page_size: number
  transaction_type?: 'top_up' | 'settlement' | 'transfer' | 'payment'
  status?: 'completed' | 'pending' | 'failed' | 'cancelled'
  start_date?: string // YYYY-MM-DD format
  end_date?: string // YYYY-MM-DD format
  search?: string // Search by transaction number, reference, etc.
}

export interface WalletTransaction {
  id: string
  transaction_no: string
  wallet_id: string
  transaction_type: 'top_up' | 'settlement' | 'transfer' | 'payment'
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  description: string
  reference_no?: string
  bank_reference?: string
  created_date: string // ISO date string
  completed_date?: string // ISO date string
  fee_amount?: number
  net_amount?: number
  counterparty_name?: string
  counterparty_account?: string
  channel?: string // web, mobile, api
  payment_method?: string
  merchant_name?: string
  merchant_id?: string
  settlement_batch_id?: string
}

export interface WalletTransactionResponse {
  code: string
  message: string
  message_kh: string
  data: {
    transactions: WalletTransaction[]
    total_count: number
    page: number
    page_size: number
    has_more: boolean
  }
}

// Filter options for the frontend
export interface TransactionFilterOptions {
  transaction_types: Array<{
    value: string
    label: string
  }>
  status_options: Array<{
    value: string
    label: string
  }>
  date_ranges: Array<{
    value: string
    label: string
    start_date?: string
    end_date?: string
  }>
}
