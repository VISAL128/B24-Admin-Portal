import type { ApiResponse } from '~/models/baseModel'

export const useApiExecutor = () => {
  const execute = async <T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await requestFn()

      if (response.code !== 'SUCCESS') {
        console.error('API Error:', response.message)
        throw new Error(response.message || 'Unknown error')
      }

      return response
    } catch (error: any) {
      console.error('Request failed:', error)
      return {
        code: 'ERROR',
        message: error?.message || 'Failed to fetch',
        data: null as any
      }
    }
  }

  return { execute }
}
