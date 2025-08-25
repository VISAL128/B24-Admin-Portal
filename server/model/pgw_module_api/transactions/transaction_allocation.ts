export interface PaginationParam {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  rowCount: number;
  sorts: string;
  filter: string;
  currentPageToken: string | null;
}

export interface TransactionAllocationModel {
  // id: string;
  // customer: string | null;
  // transactionAmount: number;
  // billerName: string | null;
  // amount: number;
  // outstandingAmount: number;
  // currency: string;
  // date: string;
  id: string
  transactionId: string
  customer: string
  customerCode: string
  billerName: string
  billerId: string
  allocationPartyName: string
  transactionAmount: number
  amount: number
  settleAmount: number
  totalSettlement: number
  outstandingAmount: number
  currency: string
  date: string
  status: 'pending' | 'complete' | 'partial' | string
}

export interface Settlement {
  settlementId: string
  transactionId: string
  settleAmount: number
  currency: string
  status: string
  bankReference: string
  bank: string
  bankLogo: string
  customerName: string
  customerCode: string
  settleBy: string
  description: string
}

/** Allocation detail with settlements */
export interface TransactionAllocationDetail extends TransactionAllocationModel {
  settlements: Settlement[]
}

/**
 * Full API response shape for allocation list
 */
export interface TransactionAllocationResponse {
  param: PaginationParam;
  allocations: TransactionAllocationModel[];
}
