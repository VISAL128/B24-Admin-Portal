import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { QueryParams } from '~/models/baseModel'

// Define MTC API service response types
export interface MtcServiceResponse<T = unknown> {
  code: string
  message: string
  message_kh?: string
  data?: T
}

export interface MtcApiRequest {
  // Define common MTC API request structure
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, string | number | boolean>
  body?: Record<string, unknown> | unknown[]
}

export interface MtcHealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
  services?: {
    database?: 'up' | 'down'
    cache?: 'up' | 'down'
    external_apis?: 'up' | 'down'
  }
}

export interface MtcConfiguration {
  [key: string]: string | number | boolean | object
}

export interface MtcMetrics {
  [key: string]: string | number | boolean | object
}

export interface MtcBatchOperation {
  operation: string
  payload?: Record<string, unknown>
}

export const useMtcApi = () => {
  const { executeV2 } = useApiExecutor()

  /**
   * Generic MTC API call handler
   */
  const callMtcApi = async <T = unknown>(
    request: MtcApiRequest
  ): Promise<MtcServiceResponse<T>> => {
    const { endpoint, method = 'GET', params, body } = request

    return await executeV2(() =>
      $fetch<MtcServiceResponse<T>>(`/api/mtc/${endpoint}`, {
        method,
        query: params,
        body,
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Check MTC service health
   */
  const healthCheck = async (): Promise<MtcServiceResponse<MtcHealthCheckResponse>> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse<MtcHealthCheckResponse>>('/api/mtc/health', {
        method: 'GET',
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Get MTC service information
   */
  const getServiceInfo = async (): Promise<MtcServiceResponse> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse>('/api/mtc/info', {
        method: 'GET',
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Execute a specific MTC operation
   */
  const executeOperation = async (
    operation: string,
    payload?: Record<string, unknown>,
    params?: QueryParams
  ): Promise<MtcServiceResponse> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse>(`/api/mtc/operations/${operation}`, {
        method: 'POST',
        query: params,
        body: payload,
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Get available operations from MTC service
   */
  const getAvailableOperations = async (): Promise<MtcServiceResponse<string[]>> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse<string[]>>('/api/mtc/operations', {
        method: 'GET',
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Send a query to MTC service
   */
  const query = async (queryParams: Record<string, unknown>): Promise<MtcServiceResponse> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse>('/api/mtc/query', {
        method: 'POST',
        body: queryParams,
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Get MTC service configuration
   */
  const getConfiguration = async (): Promise<MtcServiceResponse<MtcConfiguration>> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse<MtcConfiguration>>('/api/mtc/config', {
        method: 'GET',
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Update MTC service configuration
   */
  const updateConfiguration = async (config: MtcConfiguration): Promise<MtcServiceResponse> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse>('/api/mtc/config', {
        method: 'PUT',
        body: config,
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Execute a batch of operations
   */
  const executeBatch = async (operations: MtcBatchOperation[]): Promise<MtcServiceResponse> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse>('/api/mtc/batch', {
        method: 'POST',
        body: { operations },
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  /**
   * Get service metrics and statistics
   */
  const getMetrics = async (): Promise<MtcServiceResponse<MtcMetrics>> => {
    return await executeV2(() =>
      $fetch<MtcServiceResponse<MtcMetrics>>('/api/mtc/metrics', {
        method: 'GET',
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  return {
    // Core service methods
    callMtcApi,
    healthCheck,
    getServiceInfo,

    // Operation methods
    executeOperation,
    getAvailableOperations,
    query,

    // Configuration methods
    getConfiguration,
    updateConfiguration,

    // Batch and metrics
    executeBatch,
    getMetrics,
  }
}
