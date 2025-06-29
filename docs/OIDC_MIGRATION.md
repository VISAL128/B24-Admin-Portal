# OpenID Connect Migration

This document describes the migration from keycloak-js to nuxt-openid-connect module for the Bill24 Admin Portal.

## Overview

The authentication system has been refactored to use the `nuxt-openid-connect` module instead of the `keycloak-js` library. This change provides:

- Better integration with Nuxt 3
- Server-side session management
- Automatic token refresh
- HTTP-only cookies for enhanced security
- Simplified authentication flow

## Changes Made

### 1. **Dependencies**
- ✅ Removed `keycloak-js` dependency
- ✅ Using `nuxt-openid-connect` module (already installed)

### 2. **Configuration**
- ✅ Updated `nuxt.config.ts` to use OIDC configuration
- ✅ Removed legacy Keycloak public runtime config
- ✅ Added proper OIDC server-side configuration

### 3. **Authentication Flow**
- ✅ Global middleware `auth.global.ts` handles route protection
- ✅ `/get-started` page serves as the authentication callback
- ✅ Authentication state managed by OIDC server-side cookies

### 4. **Composables**
- ✅ Updated `useAuth()` to work with OIDC
- ✅ Removed legacy Keycloak-specific composables:
  - `useKeycloakGuard`
  - `useAuthCallback`
  - `useAuthStorage`

### 5. **Plugins**
- ✅ Removed legacy Keycloak plugins:
  - `keycloak.client.ts`
  - `auth.client.ts`
  - `keycloak-api.client.ts`
  - `auth-navigation.client.ts`

### 6. **Pages**
- ✅ Updated `get-started.vue` to work with OIDC callbacks
- ✅ Added `auth: true/false` meta to pages for route protection
- ✅ Kept `/get-started` as the callback URL as requested

### 7. **Middleware**
- ✅ Global authentication middleware for all routes
- ✅ Specific auth middleware for protected routes
- ✅ Removed `redirect-store.ts` middleware

## New Authentication Flow

### 1. **User Access**
```
User visits protected route → Global middleware checks auth → 
If not authenticated → Redirect to OIDC login → 
After login → Redirect to /get-started → 
Process callback → Redirect to original route
```

### 2. **Page Configuration**
```typescript
// For protected pages (default)
definePageMeta({
  auth: true
})

// For public pages
definePageMeta({
  auth: false
})
```

### 3. **Using Authentication**
```typescript
const oidc = useOidc()
const { isAuthenticated, user, login, logout } = useAuth()

// Check authentication
if (oidc.isLoggedIn) {
  // User is authenticated
}

// Login
oidc.login('/return-url')

// Logout
oidc.logout('/')
```

## Environment Variables

The following environment variables are used:

```env
KEYCLOAK_URL=http://your-keycloak-server:8080
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_CALLBACK_URL=http://localhost:3000/get-started
```

## Security Improvements

1. **HTTP-Only Cookies**: Tokens are stored in HTTP-only cookies, preventing XSS attacks
2. **Server-Side Sessions**: Authentication state is managed server-side
3. **Automatic Refresh**: Token refresh is handled automatically by the server
4. **CSRF Protection**: Built-in CSRF protection with the OIDC module

## Backward Compatibility

- Legacy localStorage keys are preserved for migration compatibility
- The `useAuth()` composable maintains the same interface
- `/get-started` callback URL is preserved as requested

## Migration Checklist

- ✅ Update dependencies
- ✅ Configure OIDC in nuxt.config.ts
- ✅ Update authentication composables
- ✅ Remove legacy plugins and composables
- ✅ Update pages with auth meta
- ✅ Test authentication flow
- ✅ Test logout functionality
- ✅ Test protected route access
- ✅ Update documentation

## Notes

- Tokens are no longer accessible client-side for security reasons
- Authentication state is managed via server-side cookies
- The `/get-started` page remains the callback handler as requested
- All existing page routes and structure are preserved
