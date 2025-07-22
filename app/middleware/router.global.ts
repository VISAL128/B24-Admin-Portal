export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const restrictedRoutes = ['/digital-wallet/settlement/generate']
  if (restrictedRoutes.includes(to.path)) return navigateTo('/digital-wallet/settlement')
})
