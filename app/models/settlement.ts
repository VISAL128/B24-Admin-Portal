// 1. Get All Suppliers
export interface Supplier {
  supplierId: string
  name: string
}

// 2. Get CPOs by Supplier List
export interface CpoBySupplierRequest {
  supplierIds: string[]
}

export interface Cpo {
  cpoId: string
  supplierId: string
  name: string
}

// 3. Get Current Balance for Each CPO
export interface BalanceQueryRequest {
  supplierIds?: string[]
  cpoIds?: string[]
}

export interface CpoBalance {
  cpoId: string
  supplierId: string
  balance: number
  currency: string
}

// 4. Get Transaction History by CPO
export interface TransactionHistory {
  transactionId: string
  date: string // ISO date string
  type: 'credit' | 'debit'
  amount: number
  description: string
}

// 5. Confirm Settlement
export interface ConfirmSettlementRequest {
  settledBy: string
  suppliers: {
    supplierId: string
    cpoIds: string[]
    amount: number
  }[]
  note?: string
}

export interface ConfirmSettlementResponse {
  settlementId: string
}

// 6. Get Settlement History
export interface SettlementHistoryQuery {
  page?: number
  limit?: number
  status?: 'paid' | 'failed' | 'refunded'
  startDate?: string
  endDate?: string
}

export interface SettlementHistoryRecord {
  settlementId: string
  settlementDate: string
  totalSupplier: number
  totalAmount: number
  settledBy: string
  status: 'paid' | 'failed' | 'refunded'
}

export interface SettlementHistoryResponse {
  page: number
  limit: number
  total: number
  records: SettlementHistoryRecord[]
}
