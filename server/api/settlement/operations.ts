/**
 * Settlement Operations API Endpoint
 *
 * Demonstrates different authorization levels based on HTTP methods:
 * - GET: requires 'settlements.read' permission
 * - POST: requires 'settlements.write' permission
 * - PUT: requires 'settlements.execute' permission
 * - DELETE: requires 'admin' role
 */

import { requireAuth, requireRole, requirePermission } from '../../middleware/auth'
import type { ApiResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    const method = getMethod(event)

    // Always require authentication
    const user = requireAuth(event)

    switch (method) {
      case 'GET': {
        // Require 'settlements.read' permission for viewing settlements
        requirePermission(event, 'settlements.read')

        console.log(`📖 User ${user.username} reading settlement operations`)

        return {
          code: 'SUCCESS',
          message: 'Settlement operations retrieved successfully',
          data: {
            operations: [
              { id: 1, type: 'read', description: 'View settlement history' },
              { id: 2, type: 'read', description: 'View settlement details' },
            ],
            userPermissions: user.permissions,
          },
        }
      }

      case 'POST': {
        // Require 'settlements.write' permission for creating settlements
        requirePermission(event, 'settlements.write')

        const body = await readBody(event)
        console.log(`✏️ User ${user.username} creating settlement operation`)

        return {
          code: 'SUCCESS',
          message: 'Settlement operation created successfully',
          data: {
            operation: {
              id: Date.now(),
              type: 'create',
              createdBy: user.username,
              createdAt: new Date().toISOString(),
              ...body,
            },
          },
        }
      }

      case 'PUT': {
        // Require 'settlements.execute' permission for executing settlements
        requirePermission(event, 'settlements.execute')

        const body = await readBody(event)
        console.log(`⚡ User ${user.username} executing settlement operation`)

        return {
          code: 'SUCCESS',
          message: 'Settlement operation executed successfully',
          data: {
            operation: {
              id: body.id || Date.now(),
              type: 'execute',
              executedBy: user.username,
              executedAt: new Date().toISOString(),
              status: 'completed',
            },
          },
        }
      }

      case 'DELETE': {
        // Require 'admin' role for deleting settlements
        requireRole(event, 'admin')

        const settlementId = getQuery(event).id
        console.log(`🗑️ Admin ${user.username} deleting settlement ${settlementId}`)

        return {
          code: 'SUCCESS',
          message: 'Settlement operation deleted successfully',
          data: {
            operation: {
              id: settlementId,
              type: 'delete',
              deletedBy: user.username,
              deletedAt: new Date().toISOString(),
            },
          },
        }
      }

      default: {
        throw createError({
          statusCode: 405,
          statusMessage: 'Method not allowed',
        })
      }
    }
  } catch (error: any) {
    // Handle authentication and authorization errors
    if (error.statusCode === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        data: null,
      }
    }

    if (error.statusCode === 403) {
      return {
        code: 'FORBIDDEN',
        message: error.statusMessage || 'Insufficient permissions',
        data: null,
      }
    }

    if (error.statusCode === 405) {
      return {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
        data: null,
      }
    }

    // Handle other errors
    console.error('❌ Settlement operations API error:', error)
    return {
      code: 'ERROR',
      message: 'Failed to process settlement operation',
      data: null,
    }
  }
})
