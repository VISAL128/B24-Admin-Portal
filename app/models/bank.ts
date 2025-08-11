import type { BankServiceStatus } from "#imports"

export interface Bank {
  id: string
  bank_id: string
  name: string
  name_kh?: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  logo?: string
  active: BankServiceStatus
  activated_date: string
}

export interface BankAccount {
  id: string
  bank_id: string
  code: string
  name: string
  title: string
  account_type_id: string
  status: string
  currency_id: string
  is_default: boolean
  created_date: string
  updated_date: string
}

export interface BankListResponse {
  records: Bank[]
  total_record: number
  total_page: number
  current_page: number
  page_size: number
}
