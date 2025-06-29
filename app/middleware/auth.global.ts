export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering
  if (import.meta.server) {
    return
  }

  // Check if this route requires authentication
  const isAuthRequired = to.meta.auth !== false // Default to requiring auth unless explicitly set to false

  const oidc = useOidc()

  // If authentication is required and user is not logged in
  if (isAuthRequired && !oidc.isLoggedIn) {
    console.log('🔒 Authentication required, redirecting to OIDC login')
    
    // Don't redirect if already on get-started to prevent loops
    if (to.path !== '/get-started') {
      // Use OIDC login directly with return URL
      const returnUrl = to.fullPath
      oidc.login(returnUrl)
      return
    }
  }
  
  // If user is authenticated and on get-started, redirect to dashboard
  if (oidc.isLoggedIn && to.path === '/get-started') {
    console.log('✅ User authenticated on get-started, redirecting to dashboard')
    return navigateTo('/')
  }
})
