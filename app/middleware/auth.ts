export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering
  if (import.meta.server) return
  
  const oidc = useOidc()
  
  // If user is not authenticated, redirect to get-started for callback handling
  if (!oidc.isLoggedIn) {
    oidc.login(to.fullPath)
  }
  
  console.log('✅ User authenticated, allowing access')
})