export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering
  if (import.meta.server) return

  const oidc = useOidcAuth()

  // If user is not authenticated, redirect to get-started for callback handling
  if (!oidc.loggedIn) {
    oidc.login()
  }
  navigateTo(to.fullPath)
})