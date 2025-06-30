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
 * - Backward compatibility with localStorage (optional)
 * - Automatic token management via OIDC
 */

import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

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

interface StoredAuthData {
  user: UserInfo | null
  authenticated: boolean
  lastSync: number
}

export const useAuth = () => {
  const oidc = useOidc()
  
  // Core reactive state
  const user = ref<UserInfo | null>(null)
  
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
      fullName: `${oidcUser.given_name || ''} ${oidcUser.family_name || ''}`.trim() || 
                oidcUser.preferred_username || oidcUser.email || '',
      roles: oidcUser.realm_access?.roles || oidcUser.roles || [],
      picture: oidcUser.picture || ''
    }
  }

  /**
   * Initialize user data from OIDC
   */
  const initializeUserData = async () => {
    if (oidc.isLoggedIn && oidc.user) {
      user.value = extractUserInfo()
      
      // Optional: Store in localStorage for backward compatibility
      if (user.value) {
        const authData: StoredAuthData = {
          user: user.value,
          authenticated: true,
          lastSync: Date.now()
        }
        
        const storage = useStorage<StoredAuthData>()
        storage.setItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA, authData, 24 * 60 * 60) // 24 hours
      }
    } else {
      user.value = null
      
      // Clear localStorage when not authenticated
      const storage = useStorage()
      storage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA)
    }
  }

  /**
   * Initiate login flow
   */
  const login = async (redirectTo?: string): Promise<void> => {
    try {
      const returnUrl = redirectTo || '/'
      oidc.login(returnUrl)
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
      // Clear localStorage data
      const storage = useStorage()
      storage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA)
      
      // Clear legacy authentication data
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        if (key.toLowerCase().includes('keycloak')) {
          storage.removeItem(key)
        }
      })
      
      // Clear user state
      user.value = null
      
      // Perform OIDC logout
      oidc.logout('/') // Redirect to home after logout
      
    } catch (error) {
      console.error('❌ Logout failed:', error)
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
    return user.value || extractUserInfo()
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
      await initializeUserData()
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

  // Watch for authentication state changes
  watch(
    () => oidc.isLoggedIn,
    () => {
      initializeUserData()
    },
    { immediate: true }
  )

  // Initialize user data on composable creation
  nextTick(() => {
    initializeUserData()
  })

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
