import type { Supplier } from '~/models/supplier'

export interface SubBillerQuery {
  Search?: string
  PageIndex?: number
  PageSize?: number
}

export interface SubBillerListResponse {
  param: PaginationParam
  result: Supplier[]
}

export interface PaginationParam {
  pageIndex: number
  pageSize: number
  pageCount: number
  rowCount: number
  sorts: string
  filter: string
}
