export interface Bank {
  id: string
  bank_code: string
  bank_name: string
  bank_short_name: string
  swift_code?: string
  description?: string
  country_code: string
  currency_code: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  account_number?: string
  account_name?: string
  branch_name?: string
  branch_code?: string
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  address?: string
  logo_url?: string
  website_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
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

export interface CreateBankRequest {
  bank_code: string
  bank_name: string
  bank_short_name: string
  swift_code?: string
  description?: string
  country_code: string
  currency_code: string
  is_settlement_bank: boolean
  is_collection_bank: boolean
  account_number?: string
  account_name?: string
  branch_name?: string
  branch_code?: string
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  address?: string
  logo_url?: string
  website_url?: string
  is_active: boolean
}

export interface UpdateBankRequest extends Partial<CreateBankRequest> {
  id: string
}
