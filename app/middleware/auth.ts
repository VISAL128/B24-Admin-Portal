export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during server-side rendering
  if (import.meta.server) return

  const oidc = useOidcAuth()

  // If user is not authenticated, redirect to login
  if (!oidc.loggedIn) {
    oidc.login()
  }
  navigateTo(to.fullPath)
})