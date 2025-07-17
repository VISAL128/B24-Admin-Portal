# Server Authentication Middleware

This document explains how to use the server-side authentication middleware for the Bill24 Payment Portal.

## Overview

The server authentication middleware provides JWT token validation, user extraction, and role-based access control for server API routes. It integrates seamlessly with the existing OIDC authentication system.

## Features

- ✅ JWT token validation and user extraction
- ✅ Role-based access control
- ✅ Permission-based authorization
- ✅ Comprehensive error handling
- ✅ Request context enhancement
- ✅ Flexible authentication patterns

## File Structure

```
server/
├── middleware/
│   └── auth.ts              # Main authentication middleware
└── api/
    ├── health.ts           # Example: Optional authentication
    ├── user/
    │   └── profile.ts      # Example: Required authentication
    ├── settlement/
    │   └── operations.ts   # Example: Permission-based auth
    └── suppliers.ts        # Example: Updated with auth
```

## How It Works

### 1. Automatic Processing

The middleware automatically:

- Extracts JWT tokens from `Authorization` headers
- Validates tokens and extracts user information
- Attaches `auth` context to every API request
- Skips processing for non-API routes

### 2. Token Extraction

Supports multiple token formats:

```http
# Bearer token (preferred)
Authorization: Bearer <jwt-token>

# Direct token
Authorization: <jwt-token>
```

### 3. User Information

Extracted user information includes:

```typescript
interface AuthenticatedUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  roles: string[]
  permissions: string[]
  picture?: string
  realm?: string
  clientId?: string
  tokenType?: 'Bearer'
  issuedAt?: number
  expiresAt?: number
}
```

## Usage Patterns

### 1. Optional Authentication

```typescript
// server/api/health.ts
import { getAuthContext } from '../middleware/auth'

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event)

  if (auth.isAuthenticated) {
    // Include user-specific data
    return { user: auth.user.username }
  }

  // Return public data
  return { status: 'public' }
})
```

### 2. Required Authentication

```typescript
// server/api/user/profile.ts
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)

    return {
      code: 'SUCCESS',
      data: { profile: user },
    }
  } catch (error) {
    if (error.statusCode === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      }
    }
    throw error
  }
})
```

### 3. Role-Based Authorization

```typescript
// server/api/admin/users.ts
import { requireRole } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, 'admin')

    // Only admins can access this endpoint
    return { data: 'admin-only-data' }
  } catch (error) {
    if (error.statusCode === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'Admin role required',
      }
    }
    throw error
  }
})
```

### 4. Permission-Based Authorization

```typescript
// server/api/settlements.ts
import { requirePermission } from '../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requirePermission(event, 'settlements.read')

    // User has specific permission
    return { data: 'settlement-data' }
  } catch (error) {
    if (error.statusCode === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'settlements.read permission required',
      }
    }
    throw error
  }
})
```

### 5. Multiple Role Authorization

```typescript
// server/api/reports.ts
import { requireAnyRole } from '../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAnyRole(event, ['admin', 'settlement-manager', 'report-viewer'])

    return { data: 'report-data' }
  } catch (error) {
    if (error.statusCode === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'Admin, settlement-manager, or report-viewer role required',
      }
    }
    throw error
  }
})
```

## Available Helper Functions

### Core Functions

| Function                               | Description                    | Returns                       |
| -------------------------------------- | ------------------------------ | ----------------------------- |
| `getAuthContext(event)`                | Get auth context               | `AuthContext`                 |
| `requireAuth(event)`                   | Require authentication         | `AuthenticatedUser` or throws |
| `requireRole(event, role)`             | Require specific role          | `AuthenticatedUser` or throws |
| `requireAnyRole(event, roles)`         | Require any of specified roles | `AuthenticatedUser` or throws |
| `requirePermission(event, permission)` | Require specific permission    | `AuthenticatedUser` or throws |

### Auth Context Methods

| Method                           | Description                    | Returns                     |
| -------------------------------- | ------------------------------ | --------------------------- |
| `auth.isAuthenticated`           | Check if user is authenticated | `boolean`                   |
| `auth.user`                      | Get user information           | `AuthenticatedUser \| null` |
| `auth.hasRole(role)`             | Check if user has role         | `boolean`                   |
| `auth.hasAnyRole(roles)`         | Check if user has any role     | `boolean`                   |
| `auth.hasPermission(permission)` | Check if user has permission   | `boolean`                   |

## Permissions System

The middleware includes a flexible permission mapping system:

### Default Role-Permission Mapping

```typescript
const permissionMap = {
  admin: [
    'settlements.read',
    'settlements.write',
    'settlements.execute',
    'suppliers.read',
    'suppliers.write',
    'reports.read',
    'reports.export',
    'users.read',
    'users.write',
  ],
  'settlement-manager': [
    'settlements.read',
    'settlements.write',
    'settlements.execute',
    'suppliers.read',
    'reports.read',
  ],
  'settlement-viewer': ['settlements.read', 'suppliers.read', 'reports.read'],
  'report-viewer': ['reports.read', 'reports.export'],
}
```

### Custom Permission Logic

You can customize the permission mapping in the `mapRolesToPermissions()` function to match your specific requirements.

## Error Handling

The middleware provides consistent error handling:

### HTTP Status Codes

| Status | Code                 | Description              |
| ------ | -------------------- | ------------------------ |
| 401    | `UNAUTHORIZED`       | Authentication required  |
| 403    | `FORBIDDEN`          | Insufficient permissions |
| 405    | `METHOD_NOT_ALLOWED` | HTTP method not allowed  |

### Error Response Format

```typescript
{
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'ERROR',
  message: 'Error description',
  data: null
}
```

## Security Considerations

### Token Validation

- ⚠️ **Development**: Basic JWT decoding without signature verification
- 🔒 **Production**: Should implement proper JWT verification using Keycloak's public key

### Production Setup

For production deployment:

1. **Replace token validation** with proper JWT verification
2. **Use Keycloak's public key** for signature verification
3. **Implement token refresh** logic if needed
4. **Add rate limiting** for API endpoints
5. **Enable HTTPS** for all communications

### Example Production Token Validation

```typescript
// Replace the validateToken function with:
import jwksClient from 'jwks-rsa'

const client = jwksClient({
  jwksUri: `${keycloakUrl}/protocol/openid_connect/certs`,
})

async function validateToken(token: string): Promise<KeycloakJwtPayload | null> {
  try {
    const decoded = jwt.decode(token, { complete: true })
    const kid = decoded?.header?.kid

    const key = await client.getSigningKey(kid)
    const signingKey = key.getPublicKey()

    const verified = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: keycloakUrl,
      audience: clientId,
    }) as KeycloakJwtPayload

    return verified
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}
```

## Testing

### Test with Authentication

```bash
# Get token from browser dev tools (Application > Local Storage)
export TOKEN="your-jwt-token"

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/profile

# Test permission-based endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/suppliers
```

### Test without Authentication

```bash
# Test public endpoint
curl http://localhost:3000/api/health

# Test protected endpoint (should return 401)
curl http://localhost:3000/api/user/profile
```

## Best Practices

1. **Always handle auth errors** in your API endpoints
2. **Use specific permissions** rather than broad roles when possible
3. **Log authentication events** for security monitoring
4. **Validate input data** even for authenticated users
5. **Implement proper CORS** for frontend integration
6. **Use HTTPS** in production
7. **Regularly rotate JWT secrets** and keys

## Integration with Frontend

The server auth middleware works seamlessly with the existing frontend authentication:

1. **Frontend** handles OIDC login/logout
2. **JWT tokens** are automatically sent with API requests
3. **Server middleware** validates tokens and provides user context
4. **API endpoints** enforce permissions based on user roles

This creates a complete authentication flow from frontend to backend.
