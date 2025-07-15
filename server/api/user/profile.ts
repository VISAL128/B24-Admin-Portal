/**
 * User Profile API Endpoint
 * 
 * Demonstrates how to use the server auth middleware
 * to get authenticated user information and enforce permissions.
 */

import { getAuthContext, requireAuth } from '../../middleware/auth'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    // Get auth context (contains user info and helper methods)
    const auth = getAuthContext(event)
    
    // Require authentication for this endpoint
    const user = requireAuth(event)
    
    // Return user profile information
    return {
      code: 'SUCCESS',
      message: 'User profile retrieved successfully',
      data: {
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          picture: user.picture,
          roles: user.roles,
          permissions: user.permissions
        },
        session: {
          isAuthenticated: auth.isAuthenticated,
          tokenType: user.tokenType,
          issuedAt: user.issuedAt ? new Date(user.issuedAt * 1000).toISOString() : null,
          expiresAt: user.expiresAt ? new Date(user.expiresAt * 1000).toISOString() : null
        }
      }
    }
  } catch (error: any) {
    // Handle authentication and authorization errors
    if (error.statusCode === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        data: null
      }
    }
    
    if (error.statusCode === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        data: null
      }
    }
    
    // Handle other errors
    console.error('❌ User profile API error:', error)
    return {
      code: 'ERROR',
      message: 'Failed to retrieve user profile',
      data: null
    }
  }
})
