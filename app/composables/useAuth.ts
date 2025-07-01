/**
 * Authentication composable for Bill24 Admin Portal
 * 
 * This composable provides a clean interface for authentication operations
 * using the nuxt-openid-connect module. It bridges the gap between the
 * OIDC module and the application's authentication needs.
 * 
 * Key features:
 * - Reactive authentication state
 * - User information management
 * - Role-based access control
 * - Automatic token management via OIDC
 */

interface UserInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  fullName: string
  picture?: string
}

export const useAuth = () => {
  const oidc = useOidc()
  
  // Core reactive state - derive user directly from OIDC
  const user = computed(() => {
    if (!oidc.isLoggedIn || !oidc.user) return null
    return extractUserInfo()
  })
  
  // Computed properties derived from OIDC state
  const isAuthenticated = computed(() => oidc.isLoggedIn)
  const isInitialized = computed(() => true) // OIDC is always initialized
  const initError = computed(() => null) // OIDC handles errors internally

  /**
   * Extract user information from OIDC user object
   */
  const extractUserInfo = (): UserInfo | null => {
    if (!oidc.user) return null

    const oidcUser = oidc.user
    return {
      id: oidcUser.sub || '',
      username: oidcUser.preferred_username || oidcUser.email || '',
      email: oidcUser.email || '',
      firstName: oidcUser.given_name || '',
      lastName: oidcUser.family_name || '',
      fullName: (
        `${oidcUser.given_name || ''} ${oidcUser.family_name || ''}`.trim() ||
        oidcUser.preferred_username ||
        oidcUser.email ||
        ''
      ),
      roles: oidcUser.realm_access?.roles || oidcUser.roles || [],
      picture: oidcUser.picture || ''
    }
  }

  /**
   * Optional: Sync user data to localStorage for backward compatibility
   */
  // const syncToLocalStorage = () => {
  //   // const storage = useStorage<StoredAuthData>()
    
  //   if (oidc.isLoggedIn && user.value) {
  //     // const authData: StoredAuthData = {
  //     //   user: user.value,
  //     //   authenticated: true,
  //     //   lastSync: Date.now()
  //     // }
  //     // storage.setItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA, authData, 24 * 60 * 60) // 24 hours
  //   } else {
  //     // storage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA)
  //   }
  // }

  /**
   * Initiate login flow
   */
  const login = async (redirectTo?: string): Promise<void> => {
    try {
      const returnUrl = redirectTo || '/'
      
      // Navigate to the login endpoint with redirect parameter
      await navigateTo(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`, { 
        external: false,
        replace: true
      })
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  /**
   * Logout and clean up all authentication data
   */
  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Starting logout process...')
      
      // Navigate to logout page which will handle the actual logout process
      await navigateTo('/auth/logout', { 
        external: false,
        replace: true 
      })
      
    } catch (error) {
      console.error('❌ Logout failed:', error)
      // Fallback: navigate to logout page even if navigation fails
      await navigateTo('/auth/logout', { replace: true })
      throw error
    }
  }

  /**
   * Registration - redirects to login as OIDC doesn't handle direct registration
   */
  const register = async (): Promise<void> => {
    try {
      await login()
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw error
    }
  }

  /**
   * Get current user information
   */
  const getUserInfo = (): UserInfo | null => {
    return user.value
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    const userInfo = getUserInfo()
    return userInfo?.roles.includes(role) || false
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    const userInfo = getUserInfo()
    if (!userInfo?.roles) return false
    return roles.some(role => userInfo.roles.includes(role))
  }

  /**
   * Refresh user information from OIDC
   */
  const refreshUserInfo = async (): Promise<UserInfo | null> => {
    try {
      await oidc.fetchUser()
      // syncToLocalStorage()
      console.log('✅ User info refreshed successfully')
      return getUserInfo()
    } catch (error) {
      console.error('❌ User info refresh failed:', error)
      await logout()
      return null
    }
  }

  /**
   * Check if authentication is still valid
   */
  const validateAuth = async (): Promise<boolean> => {
    try {
      await oidc.fetchUser()
      return oidc.isLoggedIn
    } catch (error) {
      console.error('❌ Authentication validation failed:', error)
      return false
    }
  }

  // Watch for authentication state changes and sync to localStorage
  watch(
    () => [oidc.isLoggedIn, oidc.user],
    () => {
      // syncToLocalStorage()
    },
    { immediate: true, deep: true }
  )

  return {
    // State
    isAuthenticated,
    isInitialized,
    initError,
    user: readonly(user),
    
    // Methods
    login,
    logout,
    register,
    getUserInfo,
    hasRole,
    hasAnyRole,
    refreshUserInfo,
    validateAuth,
    
    // Legacy compatibility (deprecated - tokens not available in OIDC)
    getToken: () => {
      console.warn('⚠️ getToken() is deprecated - tokens are managed server-side with OIDC')
      return null
    },
    refreshAuthToken: refreshUserInfo,
    updateToken: validateAuth,
    isTokenExpired: () => !oidc.isLoggedIn,
    
    // Backward compatibility
    token: computed(() => null),
    refreshToken: computed(() => null)
  }
}