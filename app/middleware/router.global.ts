export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const restrictedRoutes = ['']
  if (restrictedRoutes.includes(to.path)) return navigateTo('/')
})
