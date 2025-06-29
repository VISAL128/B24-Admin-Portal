export default defineNuxtRouteMiddleware(() => {
  // Skip middleware during server-side rendering
  if (import.meta.server) return
  
  const oidc = useOidc()
  
  // If user is not authenticated, redirect to get-started for callback handling
  if (!oidc.isLoggedIn) {
    console.log('🔒 User not authenticated, redirecting to get-started')
    return navigateTo('/get-started')
  }
  
  console.log('✅ User authenticated, allowing access')
})