import type { ApiResponse } from '~/models/baseModel'
import { useApiExecutor } from './useApiExecutor'
import type { authorizeTokenResponse, Supplier } from '~/models/settlement'

const baseUrl = process.env.SECURITY_API_URL || 'https://staging.bill24.io:22030'

export const authorizeTokenApi = () => {
  const {executeV2 } = useApiExecutor()

  const getAuthorizeToken = async (): Promise<authorizeTokenResponse | null> => {
    const payload = {
      "email": "admin@ubill24.com",
      "password": "5n&A@y5txnn{3FGG",
      "clientId": "b24_admin",
      "secret": "YjI0X2FwcDpaeClAVHkjTQ==",
      "refreshToken": ""
    }

    var rep = await executeV2(() =>
      $fetch<authorizeTokenResponse>(`${baseUrl}/security/authorize`, { method: 'POST', body: payload })
    )
    
    return rep 
  }
}