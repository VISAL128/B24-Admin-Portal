import type { FilterOperatorPgwModule } from '~/utils/enumModel'

export interface ApiResponse<T> {
  code: string | number // e.g., "SUCCESS"
  message: string
  message_kh?: string // Optional localized message
  total_records?: number
  total_pages?: number
  page?: number
  page_size?: number
  data: T
}

export interface PgwModuleResponse<T> {
  code: string // '000'
  message: string // 'Success'
  message_kh?: string // 'ជោគជ័យ'
  data?: T
}

export interface PgwModuleResponseList<T> {
  param: {
    pageIndex: number
    pageSize: number
    pageCount: number
    rowCount: number
    sorts: string
    filter: string
  },
  result: T[]
}

export interface PgwModuleResponseLists<T> {
  param: {
    pageIndex: number
    pageSize: number
    pageCount: number
    rowCount: number
    sorts: string
    filter: string
  },
  results: T[]
}

/** * Query parameters for PGW Module API requests
 * This interface can be extended based on specific API requirements
*/
export interface QueryParams {
  page?: number
  page_size?: number
  search?: string
  start_date?: string
  end_date?: string
  statuses?: string[]
  sorts?: {
    field: string
    direction: 'asc' | 'desc'
  }[]
  sortAsString?: string // Optional for direct string sort
  filters: {
    field: string
    operator: FilterOperatorPgwModule
    value: string | number | boolean | Date
  }[]
}

/**
 * Transaction-specific query parameters for Transaction List v2 API
 * Extends QueryParams and adds transaction-specific parameters
 */
export interface TransactionQueryParams extends QueryParams {
  // API-specific parameter names (what the backend expects)
  Statuses?: string[] // Multiple status filters: Statuses=pending&Statuses=failed
  Types?: string[] // Multiple transaction type filters: Types=wallet_topup&Types=qr_pay
}