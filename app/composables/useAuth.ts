interface UserInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  fullName: string
}

export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  const { 
    getStoredKeycloakData, 
    clearKeycloakData, 
    getStoredToken,
    storeKeycloakData,
    updateStoredTokens
  } = useLocalStorage()
  
  // Handle case where Keycloak plugin hasn't loaded yet
  const keycloak = computed(() => nuxtApp.$keycloak)
  const isAuthenticated = computed(() => nuxtApp.$isAuthenticated?.value ?? false)
  const isInitialized = computed(() => nuxtApp.$isKeycloakInitialized?.value ?? false)
  const initError = computed(() => nuxtApp.$keycloakInitError?.value ?? null)
  
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // Initialize user data if authenticated
  const initializeUserData = () => {
    const keycloakInstance = keycloak.value
    if (keycloakInstance && keycloakInstance.authenticated) {
      user.value = getUserInfo()
      token.value = keycloakInstance.token || null
      refreshToken.value = keycloakInstance.refreshToken || null
      
      // Store in localStorage
      storeKeycloakData(keycloakInstance)
    } else {
      // Try to load from localStorage if Keycloak is not ready yet
      const storedData = getStoredKeycloakData()
      if (storedData && storedData.authenticated) {
        user.value = storedData.user
        token.value = storedData.token
        refreshToken.value = storedData.refreshToken
      } else {
        user.value = null
        token.value = null
        refreshToken.value = null
      }
    }
  }

  // Authentication methods
  const login = async (): Promise<void> => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance) throw new Error('Keycloak not initialized')
    
    try {
      await keycloakInstance.login({
        redirectUri: window.location.origin
      })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance) throw new Error('Keycloak not initialized')
    
    try {
      // Clear session state before logout
      const { clearKeycloakState } = useKeycloakGuard()
      clearKeycloakState()
      
      // Clear localStorage data
      clearKeycloakData()
      
      await keycloakInstance.logout({
        redirectUri: window.location.origin
      })
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const register = async (): Promise<void> => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance) throw new Error('Keycloak not initialized')
    
    try {
      await keycloakInstance.register({
        redirectUri: window.location.origin
      })
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const getToken = (): string | null => {
    // Try to get token from Keycloak instance first
    const keycloakToken = keycloak.value?.token || null
    if (keycloakToken) return keycloakToken
    
    // Fallback to localStorage
    return getStoredToken()
  }

  const refreshAuthToken = async (): Promise<string | null> => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance) return null

    try {
      const refreshed = await keycloakInstance.updateToken(30)
      if (refreshed) {
        token.value = keycloakInstance.token || null
        refreshToken.value = keycloakInstance.refreshToken || null
        
        // Update localStorage with new tokens
        const expiresAt = keycloakInstance.tokenParsed?.exp ? keycloakInstance.tokenParsed.exp * 1000 : null
        updateStoredTokens(
          keycloakInstance.token || null,
          keycloakInstance.refreshToken || null,
          keycloakInstance.idToken || null,
          expiresAt
        )
        
        console.log('Token refreshed successfully')
      }
      return keycloakInstance.token || null
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearKeycloakData()
      await logout()
      return null
    }
  }

  const updateToken = async (minValidity: number = 30): Promise<boolean> => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance) return false

    try {
      const refreshed = await keycloakInstance.updateToken(minValidity)
      if (refreshed) {
        token.value = keycloakInstance.token || null
        refreshToken.value = keycloakInstance.refreshToken || null
        
        // Update localStorage with new tokens
        const expiresAt = keycloakInstance.tokenParsed?.exp ? keycloakInstance.tokenParsed.exp * 1000 : null
        updateStoredTokens(
          keycloakInstance.token || null,
          keycloakInstance.refreshToken || null,
          keycloakInstance.idToken || null,
          expiresAt
        )
      }
      return refreshed
    } catch (error) {
      console.error('Failed to update token:', error)
      clearKeycloakData()
      return false
    }
  }

  const isTokenExpired = (): boolean => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance || !keycloakInstance.token) return true
    return keycloakInstance.isTokenExpired()
  }

  const getUserInfo = (): UserInfo | null => {
    const keycloakInstance = keycloak.value
    if (!keycloakInstance?.tokenParsed) return null

    const tokenParsed = keycloakInstance.tokenParsed
    return {
      id: tokenParsed.sub || '',
      username: tokenParsed.preferred_username || '',
      email: tokenParsed.email || '',
      firstName: tokenParsed.given_name || '',
      lastName: tokenParsed.family_name || '',
      fullName: `${tokenParsed.given_name || ''} ${tokenParsed.family_name || ''}`.trim() || tokenParsed.preferred_username || '',
      roles: tokenParsed.realm_access?.roles || []
    }
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
  watch([isAuthenticated, isInitialized], () => {
    if (isInitialized.value) {
      initializeUserData()
    }
  }, { immediate: true })

  // Initialize user data on first load
  nextTick(() => {
    if (isInitialized.value) {
      initializeUserData()
    }
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
