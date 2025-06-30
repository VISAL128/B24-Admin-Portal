/**
 * Global authentication middleware for the Bill24 Admin Portal
 * 
 * This middleware ensures that users are authenticated before accessing protected routes.
 * It works in conjunction with the nuxt-openid-connect module to provide seamless
 * authentication flow using OIDC/OAuth2.
 * 
 * Flow:
 * 1. Check if route requires authentication (default: true, unless meta.auth = false)
 * 2. If auth required and user not logged in -> redirect to OIDC login
 * 3. If user logged in and on callback page -> redirect to dashboard
 */

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering for better performance
  if (import.meta.server) {
    return
  }

  const oidc = useOidc()
  
  // Check if this route requires authentication
  // Routes can opt-out by setting meta.auth = false
  const isAuthRequired = to.meta.auth !== false
  
  // Skip auth check for the callback/error pages to prevent redirect loops
  const isCallbackPage = to.path === '/get-started'
  const isErrorPage = to.path === '/auth-error'
  
  console.log(`🔐 Auth Middleware - Path: ${to.path}, Auth Required: ${isAuthRequired}, Logged In: ${oidc.isLoggedIn}`)

  // Handle unauthenticated users trying to access protected routes
  if (isAuthRequired && !oidc.isLoggedIn && !isCallbackPage && !isErrorPage) {
    console.log('� Access denied - redirecting to OIDC login')
    
    // Store the intended destination for post-login redirect
    const returnUrl = to.fullPath
    oidc.login(returnUrl)
    return
  }
  
  // Handle authenticated users on the callback page
  if (oidc.isLoggedIn && isCallbackPage) {
    console.log('✅ User authenticated on callback page - redirecting to dashboard')
    return navigateTo('/')
  }
})
