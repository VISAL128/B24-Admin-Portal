/**
 * Profile validation middleware
 * Ensures user has a valid profile before accessing protected routes
 */
export default defineNuxtRouteMiddleware((to) => {
  const { hasValidProfile } = useAuth()
  if (hasValidProfile.value) {
    return navigateTo('/')
  }
  // Skip validation for profile error page and public routes
  if (to.path === '/profile-error' || to.meta.auth === false) {
    return
  }

  // Only run on client side
  if (!import.meta.client) return

  const { getValidatedProfile, isProfileErrorPage } = useProfileValidation()

  // Don't redirect if already on profile error page
  if (isProfileErrorPage()) return

  // Check if profile exists and is valid
  const profile = getValidatedProfile()
  if (!profile) {
    console.error('Profile middleware: No valid profile found')
    return navigateTo('/profile-error')
  }
})
