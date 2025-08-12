// ~/models/bank.ts
export interface PaginationParam {
  pageIndex: number
  pageSize: number
  pageCount: number
  rowCount: number
  sorts: string
  filter: string
  currentPageToken: string | null
}

export interface BankItem {
  code: string
  name: string
  logoUrl: string
  id: string
}

export interface TBankListResponse {
  param: PaginationParam
  result: BankItem[]
}
