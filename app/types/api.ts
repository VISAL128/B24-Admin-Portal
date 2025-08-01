/**
 * Generic API Response Interface
 * 
 * This interface supports multiple common API response formats:
 * - Laravel-style: { data: T[], total: number, current_page: number, last_page: number }
 * - Django-style: { results: T[], count: number }
 * - Custom style: { records: T[], total_record: number, total_page: number }
 * 
 * Usage examples:
 * 
 * 1. Basic usage:
 * ```typescript
 * interface User {
 *   id: number
 *   name: string
 * }
 * 
 * const response: ApiResponse<User> = {
 *   data: [{ id: 1, name: 'John' }],
 *   total: 1,
 *   current_page: 1
 * }
 * ```
 * 
 * 2. With additional metadata:
 * ```typescript
 * const response: ApiResponse<User> = {
 *   records: users,
 *   total_record: 100,
 *   total_page: 10,
 *   metadata: {
 *     processing_time: '150ms',
 *     cache_hit: true
 *   }
 * }
 * ```
 */
export interface ApiResponseDynamic<T = Record<string, unknown>> {
  // Data arrays - different naming conventions
  records?: T[]
  data?: T[]
  results?: T[]
  items?: T[]
  
  // Total count - different naming conventions
  total_record?: number
  total_records?: number
  total?: number
  count?: number
  total_count?: number
  
  // Pagination - different naming conventions
  total_page?: number
  total_pages?: number
  last_page?: number
  page_count?: number
  
  // Current page
  page?: number
  current_page?: number
  
  // Page size
  per_page?: number
  page_size?: number
  limit?: number
  
  // Additional common fields
  status?: string
  message?: string
  success?: boolean
  error?: string | null
  errors?: Record<string, string[]>
  
  // Metadata
  metadata?: Record<string, unknown>
  meta?: Record<string, unknown>
  
  // Allow additional dynamic fields
  [key: string]: unknown
}

/**
 * Standardized data extraction result
 */
export interface ExtractedApiData<T> {
  data: T[]
  total: number
  totalPages: number
  currentPage: number
  pageSize: number
  rawResponse: ApiResponseDynamic<T>
}

/**
 * Helper function to extract standardized data from various API response formats
 * 
 * @param response - The API response to extract data from
 * @returns Standardized data object
 * 
 * @example
 * ```typescript
 * const apiResponse = await fetchUsers()
 * const { data, total, totalPages } = extractApiResponseData(apiResponse)
 * ```
 */
export function extractApiResponseData<T>(response: ApiResponseDynamic<T>): ExtractedApiData<T> {
  // Extract data array - try different field names
  const data = response.records || response.data || response.results || response.items || []
  
  // Extract total count - try different field names
  const total = response.total_record ?? 
                response.total_records ?? 
                response.total ?? 
                response.count ?? 
                response.total_count ?? 
                0
  
  // Extract total pages - try different field names
  const totalPages = response.total_page ?? 
                     response.total_pages ?? 
                     response.last_page ?? 
                     response.page_count ?? 
                     0
  
  // Extract current page
  const currentPage = response.page ?? response.current_page ?? 1
  
  // Extract page size
  const pageSize = response.per_page ?? response.page_size ?? response.limit ?? 10
  
  return {
    data,
    total,
    totalPages,
    currentPage,
    pageSize,
    rawResponse: response
  }
}

/**
 * Parameters for API requests with pagination and filtering
 */
export interface ApiRequestParams {
  page?: number
  pageSize?: number
  per_page?: number
  limit?: number
  search?: string
  query?: string
  startDate?: string
  start_date?: string
  endDate?: string
  end_date?: string
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Type for API fetch functions used in tables
 */
export type ApiFetchFunction<T, R extends ApiResponseDynamic<T> = ApiResponseDynamic<T>> = (
  params?: ApiRequestParams
) => Promise<R | null | undefined>
