

export interface TransactionHistoryQuery {
  start_date?: string
  end_date?: string
  status?: string
  name?: string
  page?: number
  page_size?: number
}


export interface TransactionHistoryRecord {
  id: string
  date: Date
  bankReference: string
  collectionBank: string
  settlementBank: string
  settlement_type: string
  transactionAmount: number
  currency: string
  status: string
  numberOfCustomer: number
  transactionType: string
  subSupplier: string
}


export interface TransactionListResponse {
  param: PaginationParam
  results: TransactionHistoryRecord[]
}

export interface PaginationParam {
  pageIndex: number
  pageSize: number
  pageCount: number
  rowCount: number
  sorts: string
  filter: string
}