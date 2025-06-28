interface StoredKeycloakData {
  token: string | null
  refreshToken: string | null
  idToken: string | null
  user: {
    id: string
    username: string
    email: string
    firstName: string
    lastName: string
    roles: string[]
    fullName: string
  } | null
  expiresAt: number | null
  authenticated: boolean
}

/**
 * Composable for managing Keycloak token and user data in localStorage
 */
export const useLocalStorage = () => {
  const STORAGE_KEY = 'authenticated-data'
  const TOKEN_BUFFER_TIME = 60 // seconds before expiration to consider token as expired

  /**
   * Store Keycloak data in localStorage
   */
  const storeKeycloakData = (keycloakInstance: any) => {
    if (!process.client || !keycloakInstance) return

    try {
      const expiresAt = keycloakInstance.tokenParsed?.exp 
        ? keycloakInstance.tokenParsed.exp * 1000 // Convert to milliseconds
        : null

      const userData = keycloakInstance.tokenParsed ? {
        id: keycloakInstance.tokenParsed.sub || '',
        username: keycloakInstance.tokenParsed.preferred_username || '',
        email: keycloakInstance.tokenParsed.email || '',
        firstName: keycloakInstance.tokenParsed.given_name || '',
        lastName: keycloakInstance.tokenParsed.family_name || '',
        fullName: `${keycloakInstance.tokenParsed.given_name || ''} ${keycloakInstance.tokenParsed.family_name || ''}`.trim() || keycloakInstance.tokenParsed.preferred_username || '',
        roles: keycloakInstance.tokenParsed.realm_access?.roles || []
      } : null

      const dataToStore: StoredKeycloakData = {
        token: keycloakInstance.token || null,
        refreshToken: keycloakInstance.refreshToken || null,
        idToken: keycloakInstance.idToken || null,
        user: userData,
        expiresAt,
        authenticated: !!keycloakInstance.authenticated
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
      console.log('🔐 Keycloak data stored in localStorage')
    } catch (error) {
      console.error('❌ Failed to store Keycloak data in localStorage:', error)
    }
  }

  /**
   * Retrieve Keycloak data from localStorage
   */
  const getStoredKeycloakData = (): StoredKeycloakData | null => {
    if (!process.client) return null

    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) return null

      const data: StoredKeycloakData = JSON.parse(storedData)
      
      // Check if token is expired
      if (data.expiresAt && data.expiresAt < Date.now() + (TOKEN_BUFFER_TIME * 1000)) {
        console.log('⏰ Stored token is expired, clearing localStorage')
        clearKeycloakData()
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Failed to retrieve Keycloak data from localStorage:', error)
      clearKeycloakData() // Clear corrupted data
      return null
    }
  }

  /**
   * Clear Keycloak data from localStorage
   */
  const clearKeycloakData = () => {
    if (!process.client) return

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('🗑️ Keycloak data cleared from localStorage')
    } catch (error) {
      console.error('❌ Failed to clear Keycloak data from localStorage:', error)
    }
  }

  /**
   * Check if stored token is still valid
   */
  const isStoredTokenValid = (): boolean => {
    const storedData = getStoredKeycloakData()
    if (!storedData || !storedData.token || !storedData.expiresAt) {
      return false
    }

    return storedData.expiresAt > Date.now() + (TOKEN_BUFFER_TIME * 1000)
  }

  /**
   * Update only the token information in localStorage (for token refresh)
   */
  const updateStoredTokens = (token: string | null, refreshToken: string | null, idToken: string | null, expiresAt: number | null) => {
    if (!process.client) return

    try {
      const existingData = getStoredKeycloakData()
      if (!existingData) return

      const updatedData: StoredKeycloakData = {
        ...existingData,
        token,
        refreshToken,
        idToken,
        expiresAt
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
      console.log('🔄 Keycloak tokens updated in localStorage')
    } catch (error) {
      console.error('❌ Failed to update tokens in localStorage:', error)
    }
  }

  /**
   * Get stored user information
   */
  const getStoredUser = () => {
    const storedData = getStoredKeycloakData()
    return storedData?.user || null
  }

  /**
   * Get stored token
   */
  const getStoredToken = () => {
    const storedData = getStoredKeycloakData()
    return storedData?.token || null
  }

  /**
   * Get stored refresh token
   */
  const getStoredRefreshToken = () => {
    const storedData = getStoredKeycloakData()
    return storedData?.refreshToken || null
  }

  return {
    storeKeycloakData,
    getStoredKeycloakData,
    clearKeycloakData,
    isStoredTokenValid,
    updateStoredTokens,
    getStoredUser,
    getStoredToken,
    getStoredRefreshToken
  }
}
