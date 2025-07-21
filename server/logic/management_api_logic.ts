import type { FeeModel, SettlementHistoryDetailQuery } from '~/models/settlement'
import type { SettlementInquiryRequest } from '~~/server/model/management_api/settlement'

let token: string | PromiseLike<string | null> | null = null
let tokenExpireTime: string | number | Date | null = null

interface authRequestPayload {
  email: string
  password: string
  clientId: string
  secret: string
  refreshToken?: string
}

export async function authenticateUser(payload: authRequestPayload): Promise<any> {
  const response = await fetch('https://staging.bill24.io:22030/security/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

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

export async function requestToManagementApi(
  endpoint: string,
  method: string = 'POST',
  body: any = null
): Promise<any> {
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
  const url = `${useRuntimeConfig().management_api_url}${endpoint}`
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

export async function inquirySettlementWallet(body: SettlementInquiryRequest): Promise<any> {
  return requestToManagementApi('/settlement/wallet/inquiry', 'POST', body)
}
export async function submitSettlement(body: any): Promise<any> {
  return requestToManagementApi('/settlement/wallet/submit', 'POST', body)
}
export async function getSupplierCsms(body: any): Promise<any> {
  return requestToManagementApi('/dynamic/suppliers-csms', 'POST', body)
}
export async function getCPOsBySuppliers(body: any): Promise<any> {
  return requestToManagementApi('/dynamic/suppliers-cpo', 'POST', body)
}
export async function getSettlementHistory(body: any): Promise<any> {
  return requestToManagementApi('/dynamic/settlement-history', 'POST', body)
}
export async function getSettlementHistoryById(body: SettlementHistoryDetailQuery): Promise<any> {
  return requestToManagementApi(`/dynamic/settlement-history-details`, 'POST', body)
}

export async function getListFeeConfig(body: { search: '' }): Promise<any> {
  return requestToManagementApi('/get_list_fee_config', 'POST', body)
}
export async function createFeeConfig(body: FeeModel): Promise<any> {
  return requestToManagementApi('/create_fee_config', 'POST', body)
}
export async function updateFeeConfig(body: FeeModel): Promise<any> {
  return requestToManagementApi('/update_fee_config', 'POST', body)
}
export async function findFeeConfigById(body: any): Promise<any> {
  return requestToManagementApi('/find_fee_config_by_id', 'POST', body)
}
