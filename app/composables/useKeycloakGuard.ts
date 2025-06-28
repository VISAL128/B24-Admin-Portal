// Navigation guard to prevent Keycloak re-initialization on route changes
export const useKeycloakGuard = () => {
  const { clearKeycloakData } = useLocalStorage()

  // Mark that Keycloak is already initialized for this session
  const markKeycloakReady = () => {
    if (process.client) {
      sessionStorage.setItem('keycloak-ready', 'true')
    }
  }
  
  // Check if Keycloak is already ready
  const isKeycloakReady = () => {
    if (process.client) {
      return sessionStorage.getItem('keycloak-ready') === 'true'
    }
    return false
  }
  
  // Clear Keycloak ready state on logout
  const clearKeycloakState = () => {
    if (process.client) {
      sessionStorage.removeItem('keycloak-ready')
      // Also clear localStorage data
      clearKeycloakData()
    }
  }
  
  return {
    markKeycloakReady,
    isKeycloakReady,
    clearKeycloakState
  }
}
