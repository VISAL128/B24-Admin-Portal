import type { BankServiceStatus } from "#imports"

export interface Bank {
  id: string
  name: string
  name_kh?: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  logo?: string
  active: BankServiceStatus
  activated_date: string
}

export interface BankListResponse {
  records: Bank[]
  total_record: number
  total_page: number
  current_page: number
  page_size: number
}
