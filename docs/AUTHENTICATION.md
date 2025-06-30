# Authentication Flow Documentation

This document describes the authentication flow for the Bill24 Admin Portal using Keycloak.

## Overview

The Bill24 Admin Portal uses Keycloak for authentication and authorization. The authentication flow consists of several components working together to provide a seamless user experience.

## Components

### 1. Get Started Page (`/get-started`)

The main authentication callback page that handles the OAuth2/OpenID Connect callback from Keycloak.

**Features:**
- Handles Keycloak authentication callbacks
- Displays loading states during authentication
- Shows success/error states with appropriate messaging
- Redirects users to their intended destination after successful authentication
- Provides error handling with retry options
- Includes debug information in development mode

**URL Parameters Handled:**
- `code` - Authorization code from Keycloak
- `error` - Error code if authentication failed
- `error_description` - Detailed error description
- `session_state` - Keycloak session state
- `state` - OAuth2 state parameter

### 2. Auth Error Page (`/auth-error`)

A dedicated error page for handling authentication failures with user-friendly error messages.

**Features:**
- Categorized error messages based on error type
- Retry authentication functionality
- Contact support options
- Error details for debugging
- Clean, branded error presentation

### 3. Keycloak Plugin (`plugins/keycloak.client.ts`)

The main Keycloak initialization and configuration plugin.

**Features:**
- Initializes Keycloak with proper configuration
- Handles token refresh automatically
- Manages authentication state
- Provides global Keycloak instance
- Handles authentication events (success, error, logout, token expiry)

### 4. Authentication Composables

#### `useAuthCallback`
Handles authentication callback processing and URL parameter parsing.

**Methods:**
- `parseCallbackParams()` - Parses URL parameters and fragments
- `validateCallback()` - Validates callback parameters
- `handleAuthSuccess()` - Processes successful authentication
- `handleAuthFailure()` - Handles authentication failures
- `cleanCallbackUrl()` - Cleans URL after processing
- `getRedirectUrl()` - Gets post-auth redirect URL
- `storeRedirectUrl()` - Stores pre-auth URL for redirect
- `redirectToErrorPage()` - Redirects to error page with details

#### `useKeycloakGuard`
Prevents Keycloak re-initialization during navigation.

**Methods:**
- `markKeycloakReady()` - Marks Keycloak as initialized
- `isKeycloakReady()` - Checks if Keycloak is ready
- `clearKeycloakState()` - Clears Keycloak state

#### `useLocalStorage`
Manages authentication data persistence.

**Methods:**
- `storeKeycloakData()` - Stores Keycloak tokens and user data
- `getStoredKeycloakData()` - Retrieves stored authentication data
- `clearKeycloakData()` - Clears all authentication data
- `isStoredTokenValid()` - Validates stored token expiry
- `updateStoredTokens()` - Updates tokens after refresh

### 5. Middleware

#### `auth.ts`
Protects routes that require authentication.

#### `redirect-store.ts`
Stores the current URL before authentication for post-auth redirection.

## Authentication Flow

1. **Initial Access**
   - User visits a protected route
   - `auth.ts` middleware checks authentication status
   - If not authenticated, redirects to Keycloak login
   - `redirect-store.ts` middleware stores the original URL

2. **Keycloak Login**
   - User is redirected to Keycloak login page
   - User enters credentials
   - Keycloak redirects back to `/get-started` with authorization code

3. **Callback Processing**
   - `/get-started` page receives the callback
   - `useAuthCallback` parses URL parameters
   - Keycloak plugin processes the authorization code
   - User profile is loaded and stored

4. **Success Redirect**
   - User is redirected to their original destination
   - Authentication state is maintained across sessions
   - Tokens are automatically refreshed

5. **Error Handling**
   - Authentication errors are caught and displayed
   - Users can retry authentication or contact support
   - Detailed error information is available for debugging

## Configuration

### Environment Variables

The following environment variables are required:

```bash
NUXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-server.com
NUXT_PUBLIC_KEYCLOAK_REALM=your-realm
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
```

### Keycloak Client Configuration

- **Client Type**: Public (SPA)
- **Valid Redirect URIs**: `https://your-domain.com/get-started`
- **Web Origins**: `https://your-domain.com`
- **Response Mode**: Fragment (for SPA)
- **Flow**: Standard OAuth2/OpenID Connect

## Development

### Debug Information

In development mode, the get-started page shows debug information including:
- Authentication status
- Keycloak initialization state
- Token presence
- User information
- Current URL
- Timestamp

### Testing Authentication

1. Clear browser storage to reset authentication state
2. Visit any protected route
3. You'll be redirected to Keycloak login
4. After login, you'll see the get-started page processing
5. Finally redirected to your original destination

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loop**
   - Check Keycloak client configuration
   - Verify redirect URIs match exactly
   - Clear browser storage and try again

2. **Token Refresh Failures**
   - Check token expiry settings in Keycloak
   - Verify refresh token configuration
   - Check network connectivity

3. **Authentication Errors**
   - Check browser console for detailed errors
   - Verify Keycloak server status
   - Check client configuration

### Error Codes

- `access_denied` - User denied access
- `invalid_request` - Malformed request
- `server_error` - Keycloak server error
- `temporarily_unavailable` - Service unavailable
- `unauthorized_client` - Client not authorized
- `unsupported_response_type` - Configuration error

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage with expiry
2. **Token Refresh**: Automatic refresh prevents token expiry
3. **Session Management**: Keycloak manages server-side sessions
4. **Logout**: Proper cleanup of all authentication data
5. **HTTPS**: Always use HTTPS in production

## Best Practices

1. Always check authentication status before making API calls
2. Handle token expiry gracefully with automatic refresh
3. Provide clear error messages for authentication failures
4. Store minimal user information locally
5. Clear authentication data on logout
6. Use proper error boundaries for authentication errors
