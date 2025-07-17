/**
 * Server-side Authentication Middleware for Bill24 Payment Portal
 *
 * This middleware handles authentication verification and user data extraction
 * for server-side API routes. It integrates with the OIDC authentication system
 * and provides authenticated user information to API handlers.
 *
 * Features:
 * - JWT token validation
 * - User information extraction from OIDC tokens
 * - Role-based access control data
 * - Request context enhancement with auth data
 * - Comprehensive error handling and logging
 */

import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'
import type { H3Event } from 'h3'

// Types for authentication data
export interface AuthenticatedUser {
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

export interface AuthContext {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
  token?: string
}

// JWT payload interface for Keycloak tokens
interface KeycloakJwtPayload extends JwtPayload {
  sub: string
  preferred_username?: string
  email?: string
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
  realm_access?: {
    roles: string[]
  }
  resource_access?: {
    [clientId: string]: {
      roles: string[]
    }
  }
  scope?: string
  azp?: string // Authorized party (client ID)
  typ?: string
  session_state?: string
}

/**
 * Extract Authorization token from request headers
 */
async function extractToken(event: H3Event): Promise<string | null> {
  const session = await getUserSession(event)

  if (!session?.accessToken) return null

  return session.accessToken
}

/**
 * Extract user information from validated JWT payload
 */
function extractUserFromPayload(payload: KeycloakJwtPayload): AuthenticatedUser {
  const clientId = useRuntimeConfig().oidc?.providers?.keycloak?.clientId || 'b24-admin-portal'

  // Extract roles from realm_access and resource_access
  const realmRoles = payload.realm_access?.roles || []
  const clientRoles = payload.resource_access?.[clientId]?.roles || []
  const allRoles = [...new Set([...realmRoles, ...clientRoles])]

  // Map roles to permissions (you can customize this logic)
  const permissions = mapRolesToPermissions(allRoles)

  return {
    id: payload.sub,
    username: payload.preferred_username || payload.email || '',
    email: payload.email || '',
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
    roles: allRoles,
    permissions,
    picture: payload.picture,
    realm: 'nuxt-oidc-test', // You can extract this from the token if needed
    clientId: payload.azp || clientId,
    tokenType: 'Bearer',
    issuedAt: payload.iat,
    expiresAt: payload.exp,
  }
}

/**
 * Map user roles to specific permissions
 * Customize this function based on your permission system
 */
function mapRolesToPermissions(roles: string[]): string[] {
  const permissionMap: Record<string, string[]> = {
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

  const permissions = new Set<string>()

  roles.forEach((role) => {
    const rolePermissions = permissionMap[role] || []
    rolePermissions.forEach((permission) => permissions.add(permission))
  })

  return Array.from(permissions)
}

/**
 * Validate JWT token using Keycloak public key or shared secret
 * In production, you should use Keycloak's public key for verification
 */
async function validateToken(token: string): Promise<KeycloakJwtPayload | null> {
  try {
    // In development, we'll decode without verification
    // In production, replace this with proper JWT verification using Keycloak's public key
    const decoded = jwt.decode(token) as KeycloakJwtPayload

    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token format')
    }

    // Basic validation
    const now = Math.floor(Date.now() / 1000)

    if (decoded.exp && decoded.exp < now) {
      throw new Error('Token expired')
    }

    if (decoded.iat && decoded.iat > now + 300) {
      // Allow 5 minutes clock skew
      throw new Error('Token issued in the future')
    }

    return decoded
  } catch (error) {
    console.error('❌ Token validation failed:', error)
    return null
  }
}

/**
 * Create authentication context with helper methods
 */
function createAuthContext(user: AuthenticatedUser | null, token?: string): AuthContext {
  return {
    user,
    isAuthenticated: !!user,
    token,
    hasRole: (role: string) => user?.roles.includes(role) || false,
    hasAnyRole: (roles: string[]) => {
      if (!user?.roles) return false
      return roles.some((role) => user.roles.includes(role))
    },
    hasPermission: (permission: string) => user?.permissions.includes(permission) || false,
  }
}

/**
 * Main authentication middleware
 */
export default defineEventHandler(async (event) => {
  // Skip auth middleware for certain paths
  const url = getRequestURL(event)
  const skipPaths = ['/api/_nuxt', '/api/health', '/auth/', '/_nuxt', '/favicon.ico']

  if (skipPaths.some((path) => url.pathname.startsWith(path))) {
    return
  }

  // Only process API routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  try {
    // Extract token from request
    const token = await extractToken(event)
    console.log('🔑 Extracted token:', token)

    if (!token) {
      // No token provided - set anonymous context
      event.context.auth = createAuthContext(null)
      return
    }

    // Validate token and extract user information
    const payload = await validateToken(token)

    if (!payload) {
      // Invalid token - set anonymous context
      event.context.auth = createAuthContext(null)
      console.warn('⚠️ Invalid or expired token provided')
      return
    }

    // Extract user information from token
    const user = extractUserFromPayload(payload)

    // Create and attach auth context to event
    event.context.auth = createAuthContext(user, token)

    // event.headers.append('Authorization', `Bearer ${token}`)
  } catch (error) {
    console.error('❌ Authentication middleware error:', error)
    // On error, set anonymous context
    event.context.auth = createAuthContext(null)
  }
})

/**
 * Helper function to get auth context from event (for use in API handlers)
 */
export function getAuthContext(event: H3Event): AuthContext {
  return event.context.auth || createAuthContext(null)
}

/**
 * Helper function to require authentication (throws error if not authenticated)
 */
export function requireAuth(event: H3Event): AuthenticatedUser {
  const auth = getAuthContext(event)

  if (!auth.isAuthenticated || !auth.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return auth.user
}

/**
 * Helper function to require specific role
 */
export function requireRole(event: H3Event, role: string): AuthenticatedUser {
  const user = requireAuth(event)
  const auth = getAuthContext(event)

  if (!auth.hasRole(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Role '${role}' required`,
    })
  }

  return user
}

/**
 * Helper function to require any of the specified roles
 */
export function requireAnyRole(event: H3Event, roles: string[]): AuthenticatedUser {
  const user = requireAuth(event)
  const auth = getAuthContext(event)

  if (!auth.hasAnyRole(roles)) {
    throw createError({
      statusCode: 403,
      statusMessage: `One of the following roles required: ${roles.join(', ')}`,
    })
  }

  return user
}

/**
 * Helper function to require specific permission
 */
export function requirePermission(event: H3Event, permission: string): AuthenticatedUser {
  const user = requireAuth(event)
  const auth = getAuthContext(event)

  if (!auth.hasPermission(permission)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Permission '${permission}' required`,
    })
  }

  return user
}
