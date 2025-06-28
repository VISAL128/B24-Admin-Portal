import Keycloak from 'keycloak-js'

// Global Keycloak instance to prevent re-initialization
let keycloakInstance: Keycloak.KeycloakInstance | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  
  // Check if we already have a session
  const { isKeycloakReady, markKeycloakReady } = useKeycloakGuard()
  const { 
    storeKeycloakData, 
    getStoredKeycloakData, 
    clearKeycloakData, 
    isStoredTokenValid,
    updateStoredTokens 
  } = useLocalStorage()
  
  // Skip if already initialized and ready
  if (keycloakInstance && isKeycloakReady()) {
    nuxtApp.provide('keycloak', keycloakInstance)
    nuxtApp.provide('isAuthenticated', ref(!!keycloakInstance.authenticated))
    nuxtApp.provide('isKeycloakInitialized', ref(true))
    nuxtApp.provide('keycloakInitError', ref(null))
    return
  }

  // Check for stored token data and try to restore session
  const storedData = getStoredKeycloakData()
  if (storedData && storedData.authenticated && isStoredTokenValid()) {
    console.log('🔐 Found valid stored Keycloak data, attempting to restore session...')
  }
  
  // Create Keycloak instance only once
  const keycloak = new Keycloak({
    url: config.public.keycloakUrl,
    realm: config.public.keycloakRealm,
    clientId: config.public.keycloakClientId,
  })

  // State management
  const isAuthenticated = ref(false)
  const isInitialized = ref(false)
  const initError = ref<string | null>(null)

  try {
    // Initialize Keycloak with optimized settings
    const auth = await keycloak.init({
      checkLoginIframe: false,
      onLoad: 'login-required', // 'login-required' or 'check-sso'
      messageReceiveTimeout: 10000,
      responseMode: 'fragment', // Changed back to fragment for SPA
      flow: 'standard',
      enableLogging: process.env.NODE_ENV === 'development',
      // silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      scope: 'openid profile email',
      checkLoginIframeInterval: 5,
    })

    isAuthenticated.value = auth
    isInitialized.value = true

    // Store the instance globally to prevent re-initialization
    keycloakInstance = keycloak
    
    // Mark as ready to prevent future re-initializations
    markKeycloakReady()

    // Set up automatic token refresh only if authenticated
    if (auth && keycloak.token) {
      // Store Keycloak data in localStorage
      storeKeycloakData(keycloak)
      
      // Refresh token 60 seconds before expiry to avoid frequent calls
      const refreshInterval = setInterval(() => {
        keycloak.updateToken(60).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('🔄 Token refreshed in background')
            // Update stored tokens after refresh
            const expiresAt = keycloak.tokenParsed?.exp ? keycloak.tokenParsed.exp * 1000 : null
            updateStoredTokens(
              keycloak.token || null, 
              keycloak.refreshToken || null, 
              keycloak.idToken || null, 
              expiresAt
            )
          }
        }).catch((error: any) => {
          console.error('Background token refresh failed:', error)
          clearInterval(refreshInterval)
          clearKeycloakData()
        })
      }, 300000) // Check every 5 minutes
      
      // Store the interval ID for cleanup on page unload
      if (process.client) {
        window.addEventListener('beforeunload', () => {
          clearInterval(refreshInterval)
        })
      }
    }

    // If not authenticated and we need to login, redirect to login
    if (!auth) {
      console.log('🔒 User not authenticated, redirecting to login...')
      keycloak.login({
        redirectUri: window.location.origin + '/get-started'
      })
      return // Don't continue with setup
    }

    // Set up event handlers
    keycloak.onAuthSuccess = () => {
      console.log('✅ Authentication successful')
      console.log('🎫 Token received:', keycloak.token ? 'Yes' : 'No')
      isAuthenticated.value = true
      // Store Keycloak data on successful authentication
      storeKeycloakData(keycloak)
    }

    keycloak.onAuthError = (error: any) => {
      console.error('❌ Authentication error:', error)
      isAuthenticated.value = false
      clearKeycloakData()
    }

    keycloak.onAuthLogout = () => {
      console.log('👋 User logged out')
      isAuthenticated.value = false
      clearKeycloakData()
    }

    keycloak.onTokenExpired = () => {
      console.log('⏰ Token expired, refreshing...')
      keycloak.updateToken(30).catch((error: any) => {
        console.error('❌ Failed to refresh expired token:', error)
        clearKeycloakData()
        keycloak.logout()
      })
    }

    keycloak.onAuthRefreshSuccess = () => {
      console.log('🔄 Token refresh successful')
      // Update stored tokens after successful refresh
      const expiresAt = keycloak.tokenParsed?.exp ? keycloak.tokenParsed.exp * 1000 : null
      updateStoredTokens(
        keycloak.token || null, 
        keycloak.refreshToken || null, 
        keycloak.idToken || null, 
        expiresAt
      )
    }

    keycloak.onAuthRefreshError = () => {
      console.error('❌ Token refresh failed')
      clearKeycloakData()
      keycloak.logout()
    }

  } catch (error) {
    console.error('Keycloak initialization failed:', error)
    initError.value = error instanceof Error ? error.message : 'Unknown error'
    isInitialized.value = true // Mark as initialized even with error
    clearKeycloakData()
  }

  // Provide instances to the app
  nuxtApp.provide('keycloak', keycloak)
  nuxtApp.provide('isAuthenticated', isAuthenticated)
  nuxtApp.provide('isKeycloakInitialized', isInitialized)
  nuxtApp.provide('keycloakInitError', initError)
})