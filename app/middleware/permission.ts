/**
 * Permission middleware for protecting routes based on user roles and permissions
 * Usage in page components:
 * 
 * definePageMeta({
 *   middleware: [
 *     'auth',
 *     ['permission', { 
 *       roles: ['admin', 'manager'], 
 *       permissions: ['settlement:read', 'user:manage'],
 *       resource: 'Settlement Management',
 *       action: 'view'
 *     }]
 *   ]
 * })
 */

import type { RouteLocationNormalized } from 'vue-router'

interface PermissionOptions {
  roles?: string[]
  permissions?: string[]
  resource?: string
  action?: string
  requireAll?: boolean // If true, user must have ALL specified roles/permissions
}

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // Skip if no permission requirements are defined
  if (!to.meta.permissionOptions && !to.meta.requiresPermission) {
    return
  }

  // Get permission options from route meta (try both possible locations)
  const permissionOptions = (to.meta.permissionOptions || to.meta.requiresPermission) as PermissionOptions

  if (!permissionOptions) {
    console.warn('Permission middleware called but no permission options found in route meta')
    return
  }

  // Get user information from auth composable
  const auth = useAuth()
  
  // Skip on server-side to avoid hydration issues
  if (import.meta.server) {
    return
  }
  
  const userInfo = auth.getUserInfo()

  // If no user info, redirect to login
  if (!userInfo) {
    return auth.login()
  }

  const userRoles = userInfo.roles || []
  const userPermissions = userInfo.roles || [] // Treat roles as permissions for now

  // Check if user has required roles
  const hasRequiredRoles = permissionOptions.roles ? 
    checkAccess(userRoles, permissionOptions.roles, permissionOptions.requireAll) : true

  // Check if user has required permissions
  const hasRequiredPermissions = permissionOptions.permissions ? 
    checkAccess(userPermissions, permissionOptions.permissions, permissionOptions.requireAll) : true
  // If user doesn't have access, redirect to no-permission page
  if (!hasRequiredRoles || !hasRequiredPermissions) {
    const query: Record<string, string> = {
      type: !hasRequiredRoles ? 'role' : 'permission',
    }

    if (permissionOptions.resource) {
      query.resource = permissionOptions.resource
    }

    if (permissionOptions.action) {
      query.action = permissionOptions.action
    }

    if (permissionOptions.roles) {
      query.permissions = permissionOptions.roles.join(',')
    }

    if (permissionOptions.permissions) {
      query.permissions = permissionOptions.permissions.join(',')
    }

    return navigateTo({
      path: '/no-permission',
      query
    })
  }
})

/**
 * Helper function to check if user has required access
 */
function checkAccess(userAccess: string[], requiredAccess: string[], requireAll = false): boolean {
  if (requireAll) {
    // User must have ALL required access
    return requiredAccess.every(access => userAccess.includes(access))
  } else {
    // User must have at least ONE required access
    return requiredAccess.some(access => userAccess.includes(access))
  }
}
