

export interface TransactionHistoryQuery {
  start_date?: string
  end_date?: string
  status?: string
  name?: string
  page?: number
  page_size?: number
}


export interface TransactionHistoryRecord {
  // id: string
  // date: Date
  // bankReference: string
  // collectionBank: string
  // settlementBank: string
  // settlement_type: string
  // transactionAmount: number
  // currency: string
  // status: string
  // numberOfCustomer: number
  // transactionType: string
  // subSupplier: string

    id: string;
    transactionNo: string;
    transactionType: TransactionType | string;
  
    transactionAmount: number;
    transactionAmountDisplay: string;
  
    settlementType: SettlementType | '' | null;
  
    settlementAmount: string;        
    totalAmount: number;
    totalAmountDisplay: string;
  
    currencyId: string;
    currency: string;
    currencyFormat: string;
    roundDigit: number;
  
    status: TransactionStatus | string;
    date: string;
  
    bankReference: string | null;
  
    collectionBankCode: string | null;
    collectionBankId: string | null;
    collectionBank: string | null;
    collectionBankLogo: string | null;
  
    settlementBankCode: string | null;
    settlementBankId: string | null;
    settlementBank: string | null;
    settlementBankLogo: string | null;
  
    subBiller: string | null;
    subBillerNameKh: string | null;
  
    biller: string | null;
    billerNameKh: string | null;
    billerId: string | null;
    billerCode: string | null;
  
    countTotalCustomer: number;
  
    voidPaymentRequestStatus: VoidPaymentRequestStatus | string | null;
  
    customerFee: number;
    billerFee: number;
  
    walletId: string | null;
    walletAccount: string | null;
    walletAccountDisplay: string | null;
  
    extData: string | null;
    description: string | null;
}


export interface WalletTransaction {
  tranId: string;
  tranDate: string;
  transactionNo: string;
  bankRefId: string;
  bank: string;
  tranType: string;
  wallet: string;
  status: string;
  currencyId: string;
  amount: number;
}

export interface WalletTransactionListResponse {
  param: PaginationParam
  results: WalletTransaction[]
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