export interface WalletTypeResponse {
  code: string
  message: string
  message_kh: string
  data: {
    wallet_type: string[]
    topup_wallet_ids: string[]
    settlement_wallet_ids: string[]
  }
}

export interface WalletTypeData {
  wallet_type: string[]
  topup_wallet_ids: string[]
  settlement_wallet_ids: string[]
}

export interface WalletBalanceRequest {
  wallet_ids: string[]
  page: number
  page_size: number
}

export interface WalletBalanceItem {
  currency: string
  current_balance: number
  wallet_account_number: string
  settlement_bank: string
  settlement_account_no: string
  current_balance_display: string
  settlement_account_name: string
  wallet_id: string
  wallet_type: string
}

export interface WalletBalanceResponse {
  code: string
  message: string
  message_kh: string
  data: {
    wallet_balances: WalletBalanceItem[]
    total_count: number
  }
}
