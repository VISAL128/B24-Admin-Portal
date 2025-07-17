/**
 * Admin permission guard plugin
 * This plugin runs early in the app lifecycle to ensure admin permissions
 * are checked before any components are rendered
 */

export default defineNuxtPlugin({
  name: 'admin-permission-guard',
  parallel: false, // Run this plugin sequentially to ensure proper checking
  async setup() {
    // Only run on client side
    if (import.meta.server) return

    const router = useRouter()
    const auth = useAuth()

    // Function to check if current route requires admin permission
    const routeRequiresAdmin = (route: any) => {
      // const layout = route.meta?.layout
      // const isDefaultLayout = layout === undefined || layout === 'default'

      // Check if route explicitly requires admin permission
      const permissionOptions = route.meta?.permissionOptions || route.meta?.requiresPermission
      const requiresAdmin = permissionOptions?.roles?.includes('admin')

      return requiresAdmin
    }

    // Function to perform admin permission check
    const checkAdminPermission = async () => {
      const currentRoute = router.currentRoute.value

      // Skip check for auth pages and public routes
      const publicRoutes = ['/no-permission']
      if (publicRoutes.some((route) => currentRoute.path.startsWith(route))) {
        return
      }

      // Check if route requires admin permission
      if (!routeRequiresAdmin(currentRoute)) {
        return
      }

      // Wait for auth to be available
      await nextTick()

      if (!auth.hasRole('admin')) {
        // User authenticated but not admin, redirect to no-permission
        console.warn('🚫 Access denied: User does not have admin role')
        await navigateTo({
          path: '/no-permission',
          query: {
            type: 'role',
            resource: 'Payment Portal',
            action: 'access',
            permissions: 'admin',
          },
        })
        return
      }

      console.log('✅ Admin permission check passed')
    }

    // Run initial check
    await checkAdminPermission()

    // Set up route guard for future navigation
    router.beforeEach(async (to) => {
      // Skip check for auth pages and public routes
      const publicRoutes = ['/no-permission']
      if (publicRoutes.some((route) => to.path.startsWith(route))) {
        return true
      }

      // Check if route requires admin permission
      if (!routeRequiresAdmin(to)) {
        return true
      }

      const user = auth.user.value

      if (!user) {
        auth.login()
        return
      }

      if (!auth.hasRole('admin')) {
        console.warn('🚫 Navigation blocked: User does not have admin role')
        return {
          path: '/no-permission',
          query: {
            type: 'role',
            resource: 'Payment Portal',
            action: 'access',
            permissions: 'admin',
          },
        }
      }

      return true
    })
  },
})
