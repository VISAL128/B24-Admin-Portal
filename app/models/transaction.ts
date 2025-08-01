

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
  created_date: Date
  bank_ref: string
  collection_bank: string
  settlement_bank: string
  settlement_type: string
  total_amount: number
  currency_id: string
  status: string
  total_customer: number
  transaction_type: string
  sub_biller: string
  
}
