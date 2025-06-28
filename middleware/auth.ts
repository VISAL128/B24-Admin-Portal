// File: middleware/auth.global.ts
export default defineNuxtRouteMiddleware(() => {
  const isLoggedIn = true // Replace with real check
  if (!isLoggedIn) return navigateTo('/login')
})
