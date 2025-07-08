/**
 * Permission utilities for checking user access throughout the application
 * This composable provides reactive permission checking capabilities
 */

interface UserInfo {
  email?: string
  username?: string
  roles?: string[]
  permissions?: string[]
}

interface PermissionCheck {
  roles?: string[]
  permissions?: string[]
  requireAll?: boolean
}

export const usePermissions = () => {
  // Get auth instance to sync with OIDC
  const auth = useAuth()
  
  // Reactive user info - sync with auth
  const userInfo = computed(() => {
    const authUser = auth.user.value
    if (!authUser) return null
    
    return {
      email: authUser.email,
      username: authUser.username,
      roles: authUser.roles || [],
      permissions: authUser.roles || [], // For now, treat roles as permissions
    }
  })

  // Update user info in localStorage when auth changes
  watch(userInfo, (newUserInfo) => {
    if (process.client) {
      if (newUserInfo) {
        localStorage.setItem('user-info', JSON.stringify(newUserInfo))
      } else {
        localStorage.removeItem('user-info')
      }
    }
  }, { immediate: true })

  // Initialize user info from auth or localStorage
  const initializeUserInfo = () => {
    // OIDC handles this automatically
  }

  // Update user info (for testing purposes)
  const setUserInfo = (newUserInfo: UserInfo | null) => {
    if (process.client) {
      if (newUserInfo) {
        localStorage.setItem('user-info', JSON.stringify(newUserInfo))
      } else {
        localStorage.removeItem('user-info')
      }
    }
  }

  // Check if user has specific roles
  const hasRole = (roles: string | string[], requireAll = false): boolean => {
    if (!userInfo.value?.roles) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    const userRoles = userInfo.value.roles
    
    if (requireAll) {
      return roleArray.every(role => userRoles.includes(role))
    } else {
      return roleArray.some(role => userRoles.includes(role))
    }
  }

  // Check if user has specific permissions
  const hasPermission = (permissions: string | string[], requireAll = false): boolean => {
    if (!userInfo.value?.permissions) return false
    
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    const userPermissions = userInfo.value.permissions
    
    if (requireAll) {
      return permissionArray.every(permission => userPermissions.includes(permission))
    } else {
      return permissionArray.some(permission => userPermissions.includes(permission))
    }
  }

  // Check if user has access based on roles and/or permissions
  const hasAccess = (check: PermissionCheck): boolean => {
    const hasRequiredRoles = check.roles ? hasRole(check.roles, check.requireAll) : true
    const hasRequiredPermissions = check.permissions ? hasPermission(check.permissions, check.requireAll) : true
    
    return hasRequiredRoles && hasRequiredPermissions
  }

  // Check if user is admin
  const isAdmin = computed(() => hasRole(['admin', 'administrator']))

  // Check if user is manager
  const isManager = computed(() => hasRole(['manager', 'admin', 'administrator']))

  // Get user roles as reactive computed
  const userRoles = computed(() => userInfo.value?.roles || [])

  // Get user permissions as reactive computed
  const userPermissions = computed(() => userInfo.value?.permissions || [])

  // Navigate to no-permission page with context
  const redirectToNoPermission = (options: {
    type?: 'role' | 'permission' | 'feature' | 'resource' | 'action'
    resource?: string
    action?: string
    requiredRoles?: string[]
    requiredPermissions?: string[]
    info?: string
  } = {}) => {
    const query: Record<string, string> = {
      type: options.type || 'general'
    }

    if (options.resource) query.resource = options.resource
    if (options.action) query.action = options.action
    if (options.info) query.info = options.info
    
    if (options.requiredRoles) {
      query.permissions = options.requiredRoles.join(',')
    } else if (options.requiredPermissions) {
      query.permissions = options.requiredPermissions.join(',')
    }

    return navigateTo({
      path: '/no-permission',
      query
    })
  }

  // Initialize user info on composable creation
  initializeUserInfo()

  return {
    userInfo: readonly(userInfo),
    userRoles,
    userPermissions,
    isAdmin,
    isManager,
    setUserInfo,
    hasRole,
    hasPermission,
    hasAccess,
    redirectToNoPermission,
    initializeUserInfo
  }
}
