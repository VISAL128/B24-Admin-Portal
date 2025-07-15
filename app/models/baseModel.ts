export interface ApiResponse<T> {
  code: string // e.g., "SUCCESS"
  message: string
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