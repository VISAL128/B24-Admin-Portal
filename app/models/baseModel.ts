import type { Mutable } from "@vueuse/core"

export interface ApiResponse<T> {
  code: string // e.g., "SUCCESS"
  message: string
  total_records?: number
  total_pages?: number
  page?: number
  page_size?: number
  data: T
}