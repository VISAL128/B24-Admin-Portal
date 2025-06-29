export interface ApiResponse<T> {
  code: string // e.g., "SUCCESS"
  message: string
  data: T
}