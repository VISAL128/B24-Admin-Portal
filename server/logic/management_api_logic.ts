import {SettlementInquiryRequest} from "~~/server/model/management_api/settlement";

let token: string | PromiseLike<string | null> | null = null;
let tokenExpireTime: string | number | Date | null = null;

interface authRequestPayload {
    email: string;
    password: string;
    clientId: string;
    secret: string;
    refreshToken?: string;
}

export async function authenticateUser(payload: authRequestPayload): Promise<any> {
    const response = await fetch('https://staging.bill24.io:22030/security/authorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function getToken(): Promise<string | null> {
    if(token && tokenExpireTime && new Date(tokenExpireTime) > new Date()) {
        return token;
    }
    else {
        let requestAuth = await authenticateUser({
            "email": "admin@ubill24.com",
            "password": "5n&A@y5txnn{3FGG",
            "clientId": "b24_admin",
            "secret": "YjI0X2FwcDpaeClAVHkjTQ==",
            "refreshToken": ""
        });
        if (requestAuth && requestAuth.token) {
            token = requestAuth.token;
            console.log('Token received:', token);
            tokenExpireTime = requestAuth.tokenExpireTime;
        } else {
            throw new Error('Authentication failed or token not received');
        }
    }
    return token;
}

export async function requestToManagementApi(endpoint: string, method: string = 'POST', body: any = null): Promise<any> {
    const token = await getToken();
    if (!token) {
        throw new Error('Authentication failed or token not received');
    }
    let url = `${useRuntimeConfig().management_api_url}${endpoint}`;
     const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  // Only add body for non-GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

    return response.json();
}

export async function inquirySettlementWallet(body: SettlementInquiryRequest): Promise<any> {
    return requestToManagementApi('/settlement/wallet/inquiry', 'POST', body);
}
export async function submitSettlement(body: any): Promise<any> {
    return requestToManagementApi('/settlement/wallet/submit', 'POST', body);
}
export async function getSupplierCsms(body: any): Promise<any> {
    return requestToManagementApi('/dynamic/suppliers-csms', 'POST', body);
}
export async function getCPOsBySuppliers(body: any): Promise<any> {
    return requestToManagementApi('/dynamic/suppliers-cpo', 'POST', body);
}
export async function getSettlementHistory(body: any): Promise<any> {
    return requestToManagementApi('/dynamic/settlement-history', 'POST', body);
}
export async function getSettlementHistoryById(id: string): Promise<any> {
    return requestToManagementApi(`/dynamic/settlement-history/${id}`, 'GET');
}
