import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'

export const usePgwModuleApi = () => {
  const { executeV2 } = useApiExecutor()

  /**
   * Get current user profile from PGW Module API
   */
  const getProfile = async () => {
    return await executeV2(() =>
      $fetch<PgwModuleProfile>(`/api/pgw-module/get-profile`, {
        method: 'GET',
        onResponseError() {
          // console.error('Error fetching profile from PGW Module:', _response.status, _response._data)
        },
      })
    )
  }

  return {
    getProfile
  }
}
