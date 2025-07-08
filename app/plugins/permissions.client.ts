/**
 * Permission plugin that initializes user permissions and provides global access
 * This plugin ensures permissions are available throughout the application
 */

export default defineNuxtPlugin(() => {
  const permissions = usePermissions()

  // Initialize permissions when the app starts (composable handles this internally)
  
  // Provide global permission helper
  return {
    provide: {
      permissions: {
        hasRole: (roles: string | string[], requireAll = false) => {
          return permissions.hasRole(roles, requireAll)
        },
        hasPermission: (permissionList: string | string[], requireAll = false) => {
          return permissions.hasPermission(permissionList, requireAll)
        },
        isAdmin: () => {
          return permissions.isAdmin.value
        },
        isManager: () => {
          return permissions.isManager.value
        },
        userInfo: permissions.userInfo,
        userRoles: permissions.userRoles,
        userPermissions: permissions.userPermissions
      }
    }
  }
})
