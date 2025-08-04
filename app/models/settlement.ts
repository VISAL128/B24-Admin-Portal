import type { SettlementStatus } from '#imports'

// 1. Get All Suppliers
export interface Supplier {
  id: string
  code: string
  name: string
  phone: number
  email: string
  address: string
}

// 2. Get CPOs by Supplier List
export interface CpoBySupplierRequest {
  parent_supplier_ids: string[]
}

export interface Cpo {
  id: string
  code: string
  name: string
  type: string // e.g., 'CPO', 'CSMS'
  phone: number
  email: string
  address: string
  supplier_id: string
  parent_supplier: Supplier
}

// 3. Get Current Balance for Each CPO
export interface BalanceQueryRequest {
  supplier_ids?: string[]
  cpo_ids?: string[]
}

export interface CpoBalance {
  cpo_id: string
  supplier_id: string
  balance: number
  currency: string
}

export interface authorizeTokenResponse {
  issuer: string
  token: string
  refreshToken: number
  userId: string
  email: string
  fullname: string
  tokenExpireTime: string
}

export interface InitQuerySettlement {
  main_supplier_id?: string
  cutoff_date?: string
  parties?: parties[]
  currency?: string
}

type parties = {
  id?: string
  type?: string
}

// 4. Get Transaction History by CPO
export interface TransactionAllocation {
  id: string
  amount: number
  currency_id: string
  bank_ref: string
  bank_name: string
  transaction_date: string
}
export interface SettlementInquiryResponse {
  token: string
  settlements: Settlement[]
}

export interface Settlement {
  id: string
  party_id: string
  party_type: number
  amount: number
  settlement_bank_id: string
  currency: string
  supplier: Supplier
  cpo: Cpo
  transaction_allocations: TransactionAllocation[]
}

// 5. Confirm Settlement
export interface ConfirmSettlementRequest {
  settlement_token: string
}

export interface ConfirmSettlementResponse {
  date: string
  party_id: string
  party_type: number
  party_name: number
  amount: number
  settlement_bank_id: string
  currency: string
  status: string
  message: string
  bank_ref: string
}
// 6. Get Settlement History
export interface SettlementHistoryQuery {
  start_date?: string
  end_date?: string
  status?: string[]
  search?: string
  page?: number
  page_size?: number
  supplier_id: string
}

export interface SettlementHistoryDetail {
  party_id: string // Don't have from response, unused
  settlement_id: string
  supplier_id: string
  supplier: {
    id: string
    code: string
    name: string
    phone: number
    email: string
    address: string
  }
  cpo: {
    id: string
    code: string
    name: string
    phone: number
    email: string
    address: string
  }
  settle_amount: number
  settlement_bank_id: string
  settlement_bank_name: string
  settlement_bank_logo: string | null
  bank_ref_id: string
  tran_date: string
  status: string
  party_type: string
  tran_allocates: TransactionAllocation[]
}

export interface SettlementHistoryRecord {
  id: string
  settlement_date: string
  created_date: string
  total_supplier: number
  total_amount: string
  currency_id: string
  supplier_id: string
  supplier: Supplier
  created_by: string
  total_settled: number
  success: number
  failed: number
  status: SettlementStatus
  settle_details: SettlementHistoryDetail[]
}

export interface SettlementHistoryMainDetails {
  settlement_history_id: string
  settlement_date: string
  created_date: string
  total_supplier: number
  total_amount: string
  currency_id: string
  currency: string // Added currency prevent backend passing wrong currency_id
  supplier_id: string
  supplier: Supplier
  settled_by: string
  totalSettled: number
  success: number
  failed: number
  settle_details: SettlementHistoryDetail[]
}

export interface SettlementHistoryResponse {
  total_page: number
  page: number
  total_record: number
  sum_total_amount_khr: number
  sum_total_amount_usd: number
  sum_total_settled: number
  sum_success: number
  sum_failed: number
  records: SettlementHistoryRecord[]
}

export interface SettlementHistoryDetailResponse {
  total_page: number
  page: number
  total_record: number
  records: SettlementHistoryMainDetails
}

export interface SettlementHistoryDetailQuery {
  settlement_history_id?: string
  search?: string
  status?: string
  page?: number
  page_size?: number
}

export interface FeeModel {
  id: string
  code: string
  name: string
  currency: string
  fee_type: string
  supplier_id: string
  // fee_type_data: string[]
  // currency_data: string[]
  fee_details: FeeDetail[]
  allocate_details: AlloCateDetail[]
  allocation_rule_id: string
}

export interface FeeDetail {
  start_amount: number
  end_amount: number
  fee_amount: number
  fee_rate: number
  fee_type?: string | 'fixed'
}

export interface AlloCateDetail {
  editable: boolean
  party_id: string
  name: string
  logo?: string
  party_type: number
  value: number
}

export interface SharingSupplier {
  id: string
  code: string
  name: string
  logo?: string
  value: number
}
