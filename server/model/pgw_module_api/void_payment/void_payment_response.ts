// models/void-payment-response.ts

export interface CustomerDetail {
  customerName: string
  customerCode: string
  billNumber: string | null
  amount: number
  currency: string
}

export interface VoidPaymentResponse {
  status: 'pending' | 'accepted' | 'rejected'
  bankLogo: string
  bankRef: string
  bankName: string
  transactionDate: string
  totalAmount: number
  currency: string
  billerName: string
  bankNote: string
  billerNote: string | null
  requestDate: string
  actionDate: string | null
  customerDetails: CustomerDetail[]
  actions: {
    canApprove: boolean
    canReject: boolean
  }
}
