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
  id: string;
  customer: string | null;
  transactionAmount: number;
  billerName: string | null;
  amount: number;
  outstandingAmount: number;
  currency: string;
  date: string;
}

/**
 * Full API response shape for allocation list
 */
export interface TransactionAllocationResponse {
  param: PaginationParam;
  allocations: TransactionAllocationModel[];
}
