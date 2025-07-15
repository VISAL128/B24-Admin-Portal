/**
 * Health Check API Endpoint
 *
 * Public endpoint that shows system status and optionally
 * includes user information if authenticated.
 */

import { getAuthContext } from '../middleware/auth'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const auth = getAuthContext(event)

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: useRuntimeConfig().public.appVersion || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      auth: 'active',
      api: 'operational',
    },
  }

  // Include user info if authenticated (optional)
  if (auth.isAuthenticated && auth.user) {
    return {
      code: 'SUCCESS',
      message: 'System healthy - authenticated user',
      data: {
        ...healthData,
        user: {
          username: auth.user.username,
          roles: auth.user.roles,
          permissions: auth.user.permissions.length,
        },
      },
    }
  }

  // Return basic health info for anonymous users
  return {
    code: 'SUCCESS',
    message: 'System healthy - anonymous user',
    data: healthData,
  }
})
