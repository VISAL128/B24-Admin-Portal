/**
 * Profile validation composable
 * Handles profile-related errors and validation logic
 */

import type { PgwModuleResponse } from '~/models/baseModel'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'

export const useProfileValidation = () => {
  /**
   * Validate if profile data is valid and complete
   */
  const validateProfile = (
    profile: PgwModuleResponse<PgwModuleProfile> | null | undefined
  ): boolean => {
    if (!profile) {
      console.error('Profile validation failed: Profile is null or undefined')
      return false
    }

    if (profile.code !== '000') {
      console.error('Profile validation failed: Invalid response code', profile.code)
      return false
    }

    if (!profile.data) {
      console.error('Profile validation failed: Profile data is missing')
      return false
    }

    // Add additional profile validation logic here if needed
    // For example, checking required fields:
    // if (!profile.data.id || !profile.data.email) {
    //   console.error('Profile validation failed: Missing required fields')
    //   return false
    // }

    return true
  }

  /**
   * Clear all profile-related data from storage and cookies
   */
  const clearProfileData = () => {
    try {
      // Clear from localStorage
      const storage = useStorage()
      storage.removeItem('profile')

      // Clear profile cookie
      const cookie = useCookie('profile')
      cookie.value = null
    } catch (error) {
      console.error('❌ Failed to clear profile data:', error)
    }
  }

  /**
   * Handle profile errors by redirecting to the profile error page
   */
  const handleProfileError = async (error: Error | unknown) => {
    console.error('Profile error occurred:', error)
    // Clear any existing profile data using the dedicated method
    clearProfileData()

    // Redirect to profile error page
    await navigateTo('/profile-error')
  }

  /**
   * Check if current route is the profile error page
   */
  const isProfileErrorPage = (): boolean => {
    const route = useRoute()
    return route.path === '/profile-error'
  }

  /**
   * Get profile from storage/cookie with validation
   */
  const getValidatedProfile = (): Record<string, unknown> | null => {
    try {
      const cookie = useCookie('profile')
      if (!cookie.value) return null

      // If it's a string, try to parse it
      const profile = typeof cookie.value === 'string' ? JSON.parse(cookie.value) : cookie.value

      return profile as Record<string, unknown>
    } catch (error) {
      console.error('Failed to get validated profile:', error)
      return null
    }
  }

  return {
    validateProfile,
    clearProfileData,
    handleProfileError,
    isProfileErrorPage,
    getValidatedProfile,
  }
}
