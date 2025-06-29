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

interface StoredOidcData {
  user: UserInfo | null
  authenticated: boolean
  lastSync: number
}

export const useAuth = () => {
  const oidc = useOidc()
  
  // Computed properties for the authentication state
  const isAuthenticated = computed(() => oidc.isLoggedIn)
  const isInitialized = computed(() => true) // OIDC is always initialized
  const initError = computed(() => null) // OIDC handles errors internally
  
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // Initialize user data if authenticated
  const initializeUserData = async () => {
    if (oidc.isLoggedIn && oidc.user) {
      user.value = getUserInfoFromOidc()
      
      // Store in localStorage for compatibility (optional)
      const userData: StoredOidcData = {
        user: user.value,
        authenticated: true,
        lastSync: Date.now()
      }
      
      // Store with localStorage for compatibility with existing code
      const storage = useStorage<StoredOidcData>()
      storage.setItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA, userData, 24 * 60 * 60) // 24 hours
    } else {
      user.value = null
      token.value = null
      refreshToken.value = null
    }
  }

  // Authentication methods
  const login = async (redirectTo?: string): Promise<void> => {
    try {
      const returnUrl = redirectTo || '/get-started'
      oidc.login(returnUrl)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Clear localStorage data
      const storage = useStorage()
      storage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATED_DATA)
      
      // Clear legacy keycloak data if any
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        if (key.toLowerCase().includes('keycloak')) {
          storage.removeItem(key)
        }
      })
      
      oidc.logout('/') // Redirect to home after logout
      user.value = null
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const register = async (): Promise<void> => {
    // OIDC doesn't have direct registration, redirect to login
    // This could be extended to redirect to a registration URL if needed
    try {
      await login()
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const getToken = (): string | null => {
    // In OIDC, tokens are managed server-side via HTTP-only cookies
    // Tokens are not accessible to client-side JavaScript for security
    console.warn('Tokens are not accessible client-side with OIDC. They are managed via HTTP-only cookies.')
    return null
  }

  const refreshAuthToken = async (): Promise<string | null> => {
    try {
      // In OIDC, token refresh is handled automatically server-side
      // We just need to fetch the latest user info to verify authentication
      await oidc.fetchUser()
      await initializeUserData()
      console.log('User info refreshed successfully')
      return null // Tokens are not exposed to client
    } catch (error) {
      console.error('User info refresh failed:', error)
      await logout()
      return null
    }
  }

  const updateToken = async (_minValidity: number = 30): Promise<boolean> => {
    try {
      // In OIDC, we can't check token expiry client-side
      // Just try to fetch user info to verify authentication
      await oidc.fetchUser()
      return true
    } catch (error) {
      console.error('Failed to verify authentication:', error)
      return false
    }
  }

  const isTokenExpired = (): boolean => {
    // In OIDC, we can't check token expiry client-side
    // Return false if user is logged in, true otherwise
    return !oidc.isLoggedIn
  }

  const getUserInfoFromOidc = (): UserInfo | null => {
    if (!oidc.user) return null

    const userInfo = oidc.user
    return {
      id: userInfo.sub || '',
      username: userInfo.preferred_username || userInfo.email || '',
      email: userInfo.email || '',
      firstName: userInfo.given_name || '',
      lastName: userInfo.family_name || '',
      fullName: `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || userInfo.preferred_username || userInfo.email || '',
      roles: userInfo.realm_access?.roles || userInfo.roles || [],
      picture: userInfo.picture || ''
    }
  }

  const getUserInfo = (): UserInfo | null => {
    if (user.value) return user.value
    return getUserInfoFromOidc()
  }

  const hasRole = (role: string): boolean => {
    const userRoles = getUserInfo()?.roles || []
    return userRoles.includes(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    const userRoles = getUserInfo()?.roles || []
    return roles.some(role => userRoles.includes(role))
  }

  // Watch for authentication changes
  watch([isAuthenticated], () => {
    initializeUserData()
  }, { immediate: true })

  // Initialize user data on first load
  nextTick(() => {
    initializeUserData()
  })

  return {
    isAuthenticated,
    user,
    token,
    refreshToken,
    isInitialized,
    initError,
    login,
    logout,
    register,
    getToken,
    refreshAuthToken,
    getUserInfo,
    hasRole,
    hasAnyRole,
    updateToken,
    isTokenExpired
  }
}
