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
  tran_date: string
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
  message : string
  bank_ref : string
}
// 6. Get Settlement History
export interface SettlementHistoryQuery {
  start_date?: string
  end_date?: string
  status?: string
  name?: string
  page?: number
  page_size?: number
}

export interface SettlementHistoryDetail {
  party_id: string
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
  status: string
}

export interface SettlementHistoryRecord {
  settlement_id: string
  settlement_date: string
  total_supplier: number
  total_amount: string
  currency: string
  supplier_id: string
  settled_by: string
  total_Settled: number
  success: number
  fail: number
  settle_details: SettlementHistoryDetail
}
export interface SettlementHistoryResponse {
  total_page: number
  page: number
  total_record: number
  records: SettlementHistoryRecord[]
}

export interface SettlementHistoryDetailQuery {
  settlement_history_id?: string
  search?: string
  name?: string
  page?: number
  page_size?: number
}