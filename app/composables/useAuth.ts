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
  const oidc = useOidcAuth()
  
  // Core reactive state - derive user directly from OIDC
  const user = computed(() => {
    if (!oidc.loggedIn || !oidc.user) return null
    return extractUserInfo()
  })
  
  // Computed properties derived from OIDC state
  const isAuthenticated = computed(() => oidc.loggedIn)
  /**
   * Extract user information from OIDC user object
   */
  const extractUserInfo = (): UserInfo | null => {
    if (!oidc.user) return null

    const oidcUser = (oidc.user.value?.userInfo || oidc.user.value || {}) as Record<string, any>
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
      roles: ['admin'],//oidcUser.realm_access?.roles || oidcUser.roles || [],
      picture: oidcUser.picture || ''
    }
  }

  /**
   * Initiate login flow
   */
  const login = async (): Promise<void> => {
    try {
      oidc.login()
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
    
      oidc.logout()
    } catch (error) {
      console.error('❌ Logout failed:', error)
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

  // Watch for authentication state changes and sync to localStorage
  watch(
    () => [oidc, oidc.user],
    () => {
      // syncToLocalStorage()
    },
    { immediate: true, deep: true }
  )

  return {
    // State
    isAuthenticated,
    user: readonly(user),
    
    // Methods
    login,
    logout,
    getUserInfo,
    hasRole,
    hasAnyRole,
    
    // Legacy compatibility (deprecated - tokens not available in OIDC)
    getToken: () => {
      console.warn('⚠️ getToken() is deprecated - tokens are managed server-side with OIDC')
      return null
    },
  }
}