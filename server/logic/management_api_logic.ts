import type {
  FeeModel,
  SettlementHistoryDetailQuery,
  SettlementHistoryQuery,
  SettlementHistoryResponse,
} from '~/models/settlement'
import type { SettlementInquiryRequest } from '~~/server/model/management_api/settlement'
import type { H3Event } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import { MANAGEMENT_API_ENDPOINTS } from '../utils/management-api-endpoints'

let token: string | PromiseLike<string | null> | null = null
let tokenExpireTime: string | number | Date | null = null

interface authRequestPayload {
  email: string
  password: string
  clientId: string
  secret: string
  refreshToken?: string
}

interface AuthResponse {
  token: string
  tokenExpireTime: string | number | Date
}

export async function authenticateUser(payload: authRequestPayload): Promise<AuthResponse> {
  const response = await fetch(
    `https://staging.bill24.io:22030${MANAGEMENT_API_ENDPOINTS.AUTH.AUTHORIZE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getToken(): Promise<string | null> {
  if (token && tokenExpireTime && new Date(tokenExpireTime) > new Date()) {
    return token
  } else {
    const requestAuth = await authenticateUser({
      email: 'admin@ubill24.com',
      password: '5n&A@y5txnn{3FGG',
      clientId: 'b24_admin',
      secret: 'YjI0X2FwcDpaeClAVHkjTQ==',
      refreshToken: '',
    })
    if (requestAuth && requestAuth.token) {
      token = requestAuth.token
      console.log('Token received:', token)
      tokenExpireTime = requestAuth.tokenExpireTime
    } else {
      throw new Error('Authentication failed or token not received')
    }
  }
  return token
}

export async function requestToManagementApi<T>(
  endpoint: string,
  method: string = 'POST',
  body: unknown = null,
  event?: H3Event
): Promise<T> {
  const token = await getToken()
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed or token not received',
      data: {
        showNotification: true,
        notificationType: 'error',
        title: 'Authentication Error',
        description: 'Failed to authenticate with the server. Please try logging in again.',
      },
    })
  }
  const url = `${useRuntimeConfig(event).managementApiUrl}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  // Only add body for non-GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  if (response.status >= 500) {
    console.error(`Internal Server Error: ${response.status} ${response.statusText}`)
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText || 'Internal Server Error',
      data: {
        showNotification: true,
        notificationType: 'error',
        title: 'Server Error',
        description: `The server encountered an error (${response.status}). Please try again later.`,
        statusCode: response.status,
      },
    })
  }
  if (!response.ok) {
    const errorData = {
      showNotification: true,
      notificationType: 'error',
      title: 'Request Failed',
      description: `Request failed with status ${response.status}`,
      statusCode: response.status,
    }

    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText || 'Request Failed',
      data: errorData,
    })
  }

  return response.json()
}

export async function inquirySettlementWallet(
  body: SettlementInquiryRequest
): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.SETTLEMENT.WALLET_INQUIRY, 'POST', body)
}
export async function submitSettlement(body: unknown): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.SETTLEMENT.WALLET_SUBMIT, 'POST', body)
}
export async function getSupplierCsms(body: unknown): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.DYNAMIC.SUPPLIERS_CSMS, 'POST', body)
}
export async function getCPOsBySuppliers(body: unknown): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.DYNAMIC.SUPPLIERS_CPO, 'POST', body)
}
export async function getSettlementHistory(
  body: SettlementHistoryQuery,
  event: H3Event
): Promise<ApiResponse<SettlementHistoryResponse>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.SETTLEMENT.HISTORY, 'POST', body, event)
}
export async function getSettlementHistoryById(
  body: SettlementHistoryDetailQuery
): Promise<ApiResponse<SettlementHistoryResponse>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.SETTLEMENT.HISTORY_DETAILS, 'POST', body)
}

export async function getListFeeConfig(body: { search: string }): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.FEE_CONFIG.LIST, 'POST', body)
}
export async function createFeeConfig(body: FeeModel): Promise<ApiResponse<unknown>> {
  return requestToManagementApi(MANAGEMENT_API_ENDPOINTS.FEE_CONFIG.CREATE, 'POST', body)
}
export async function updateFeeConfig(body: FeeModel): Promise<any> {
  return requestToManagementApi('/update_fee_config', 'PUT', body)
}
export async function findFeeConfigById(body: any): Promise<any> {
  return requestToManagementApi('/get_fee_config_by_id', 'POST', body)
}
