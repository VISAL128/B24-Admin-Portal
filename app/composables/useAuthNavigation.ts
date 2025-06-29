/**
 * Composable for handling authentication-related navigation
 */
export const useAuthNavigation = () => {
  const oidc = useOidc()
  const { isAuthenticated } = useAuth()

  /**
   * Navigate to dashboard if user is authenticated, otherwise to get-started
   */
  const navigateBasedOnAuth = async (): Promise<void> => {
    await nextTick()
    
    if (oidc.isLoggedIn || isAuthenticated.value) {
      console.log('🏠 User is authenticated, redirecting to dashboard')
      await navigateTo('/', { replace: true })
    } else {
      console.log('🔒 User not authenticated, redirecting to get-started')
      await navigateTo('/get-started', { replace: true })
    }
  }

  /**
   * Navigate to dashboard (for authenticated users)
   */
  const navigateToDashboard = async (): Promise<void> => {
    await navigateTo('/', { replace: true })
  }

  /**
   * Navigate to get-started page (for authentication)
   */
  const navigateToAuth = async (): Promise<void> => {
    await navigateTo('/get-started', { replace: true })
  }

  /**
   * Check if user should be redirected from current page
   */
  const shouldRedirectFromAuth = (): boolean => {
    const route = useRoute()
    const isOnAuthPage = route.path === '/get-started'
    const isAuthenticated = oidc.isLoggedIn
    
    return isOnAuthPage && isAuthenticated
  }

  /**
   * Check if user should be redirected to auth
   */
  const shouldRedirectToAuth = (): boolean => {
    const route = useRoute()
    const isOnAuthPage = route.path === '/get-started'
    const isAuthenticated = oidc.isLoggedIn
    
    return !isOnAuthPage && !isAuthenticated
  }

  return {
    navigateBasedOnAuth,
    navigateToDashboard,
    navigateToAuth,
    shouldRedirectFromAuth,
    shouldRedirectToAuth
  }
}
