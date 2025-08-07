 export interface DirectDebitPayload {
  accountNumber: string
  accountName: string
  amount: number
  currency: string
  debitDate: string 
}

export type DirectDebitStatus = 'success' | 'failed' | 'pending'

export interface DirectDebitSummary {
  id: string
  bankName: string
  bankLogo: string
  bankRef: string
  lastPushDate: string 
  status: DirectDebitStatus
  payload: DirectDebitPayload
  transactionId: string
  transactionNo: string
}