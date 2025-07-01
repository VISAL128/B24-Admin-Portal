
let token = null;
let tokenExpireTime = null;

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

export async function getToken(): string | null {
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