import type { ApiResponse } from '~/models/baseModel'

export const useApiExecutor = () => {
  const errorHandler = useErrorHandler()

  const execute = async <T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await requestFn()

      if (response.code !== 'SUCCESS') {
        console.error('API Error:', response.message)
        // Show error notification for API failures
        errorHandler.handleApiError({ message: response.message || 'API request failed' })
        throw new Error(response.message || 'Unknown error')
      }

      return response
    } catch (error: any) {
      console.error('Request failed:', error)
      // Handle and show error notification
      errorHandler.handleApiError(error)
      return {
        code: 'ERROR',
        message: error?.message || 'Failed to fetch',
        data: null as any
      }
    }
  }

  const executeV2 = async <T>(
    requestFn: () => Promise<T>
  ): Promise<T> => {
    try {
      const response = await requestFn()
      return response
    } catch (error: any) {
      console.error('Request failed:', error)
      // Handle and show error notification
      errorHandler.handleApiError(error)
      throw error // Re-throw to allow caller to handle if needed
    }
  }

  return { execute , executeV2 }
}
