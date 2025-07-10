import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { PgwModuleResponse } from '~/models/baseModel'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'

export const usePgwModuleApi = () => {
  const { executeV2 } = useApiExecutor()

  const pgwModuleApiUrl = useRuntimeConfig().public.pgw_module_api_url

  /**
   * Get current user profile from PGW Module API
   */
  const getProfile = async () => {
    return await executeV2(() =>
      $fetch<PgwModuleResponse<PgwModuleProfile>>(`/api/pgw-module/get-profile`, {
        method: 'GET',
        onResponseError({ response }) {
          console.error('Error fetching profile from PGW Module:', response.status, response._data)
        },
      })
    )
  }

  /**
   * Generic method to call any PGW Module API endpoint
   * @param endpoint - The API endpoint (without /api/pgw-module prefix)
   * @param method - HTTP method (GET, POST, etc.)
   * @param body - Request body for POST/PUT requests
   */
  const callPgwModuleApi = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<PgwModuleResponse<T>> => {
    const options: any = {
      method,
      onResponseError({ response }: any) {
        console.error(`Error calling PGW Module API ${endpoint}:`, response.status, response._data)
      },
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      options.body = body
    }

    return await executeV2(() =>
      $fetch<PgwModuleResponse<T>>(`/api/pgw-module${endpoint}`, options)
    )
  }

  return {
    getProfile,
    callPgwModuleApi,
  }
}
