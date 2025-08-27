import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { BaseResponse } from '~/types/api'

// Define MTC API service response types
export interface MtcServiceResponse<T = unknown> {
  code: string
  message: string
  message_kh?: string
  data?: T
}

// Define organization-related types based on the server endpoint
export interface TenantAccess {
  // Add specific tenant access properties as needed
  tenantId: string
  tenant: string
  tenantCode: string
  superUser: boolean
  // Add more fields based on your actual TenantAccess structure
}

export interface OrganizationListParams {
  moduleCode?: string // defaults to 'pgw' in the server endpoint
}

export const useMtcApi = () => {
  const { executeV2 } = useApiExecutor()

  /**
   * Get organization list from MTC API
   * Calls the /api/organization/list endpoint which fetches from MTC API
   */
  const getOrganizationList = async (
    params?: OrganizationListParams
  ): Promise<BaseResponse<TenantAccess[]>> => {
    return await executeV2(() =>
      $fetch<BaseResponse<TenantAccess[]>>('/api/organization/list', {
        method: 'GET',
        query: params,
        onResponseError() {
          // Handle response errors if needed
        },
      })
    )
  }

  return {
    // Organization methods
    getOrganizationList,
  }
}
