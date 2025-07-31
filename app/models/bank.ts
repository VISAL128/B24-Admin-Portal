export interface Bank {
  id: string
  bank_name: string
  currency: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  logo?: string
  activated_date: string
}

export interface BankQuery {
  search?: string
  page?: number
  page_size?: number
  is_settlement_bank?: boolean
  is_collection_bank?: boolean
  is_active?: boolean
  country_code?: string
  currency_code?: string
}

export interface BankListResponse {
  records: Bank[]
  total_record: number
  total_page: number
  current_page: number
  page_size: number
}
