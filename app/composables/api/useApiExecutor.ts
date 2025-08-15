import type { ApiResponse } from '~/models/baseModel'

export const useApiExecutor = () => {
  const errorHandler = useErrorHandler()
  const { locale } = useI18n()

  const execute = async <T>(
    requestFn: () => Promise<ApiResponse<T>>,
    showErrorMessage: boolean = true
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await requestFn()

      if (response.code !== 'SUCCESS') {
        throw new Error(
          locale.value === 'km' ? response.message_kh : response.message || 'Unknown error'
        )
      }

      return response
    } catch (error: unknown) {
      // Handle and show error notification
      if (showErrorMessage) {
        errorHandler.handleApiError(error)
      }
      return {
        code: 'ERROR',
        message: (error as Error)?.message || 'Failed to fetch',
        data: null as T,
      }
    }
  }

  const executeV2 = async <T>(requestFn: () => Promise<T>): Promise<T> => {
    try {
      const response = await requestFn()
      return response
    } catch (error: unknown) {
      // console.error('Request failed:', error)
      // Handle and show error notification
      errorHandler.handleApiError(error)
      throw error // Re-throw to allow caller to handle if needed
    }
  }

  return {
    execute,
    executeV2,
  }
}
