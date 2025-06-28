export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering
  if (process.server) return
  
  const { isAuthenticated, isInitialized, initError } = useAuth()
  
  // If Keycloak failed to initialize, show error
  if (isInitialized.value && initError.value) {
    console.error('Keycloak initialization failed:', initError.value)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication service unavailable'
    })
  }
  
  // If Keycloak is not initialized yet, wait for initialization
  if (!isInitialized.value) {
    return new Promise((resolve) => {
      const stopWatcher = watch(isInitialized, (initialized) => {
        if (initialized) {
          stopWatcher()
          // Check authentication after initialization
          if (!isAuthenticated.value) {
            // Redirect to login with current page as return URL
            const { $keycloak } = useNuxtApp()
            $keycloak.login({
              redirectUri: window.location.origin + to.fullPath
            })
          }
          resolve()
        }
      })
    })
  }
  
  // At this point, Keycloak is initialized
  // If user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    const { $keycloak } = useNuxtApp()
    return $keycloak.login({
      redirectUri: window.location.origin + to.fullPath
    })
  }
})