import { usePgwModuleApi } from './api/usePgwModuleApi'

/**
 * Composable for managing splash screen state and functionality
 */
export const useSplashScreen = () => {
  const isAppReady = ref(false)
  const showSplash = ref(true)
  const pgwApi = usePgwModuleApi()
  const { validateProfile, handleProfileError } = useProfileValidation()

  /**
   * Mark the app as ready and hide splash screen
   */
  const setAppReady = () => {
    isAppReady.value = true
  }

  /**
   * Handle splash screen completion
   */
  const onSplashComplete = () => {
    showSplash.value = false
  }

  /**
   * Manually hide splash screen
   */
  const hideSplashScreen = () => {
    showSplash.value = false
  }

  /**
   * Check if app initialization is complete
   */
  const checkAppReadiness = async () => {
    try {
      const cookie = useCookie('profile', { path: '/', maxAge: 60 * 60 * 24 * 30 })
      // Check authentication state
      const { isAuthenticated } = useAuth()

      // Check if user preferences are loaded
      const storage = useStorage()
      const _preferences = storage.getItem('user-preferences')

      // Add any other initialization checks here
      await nextTick()

      // You can add additional readiness checks here
      console.log('App initialization complete, authenticated:', isAuthenticated.value)

      if (cookie.value) {
        console.log('Profile cookie already exists, skipping profile fetch')
        // If profile cookie exists, skip fetching profile
        setAppReady()
        return true
      }
      // Try to get user profile
      const profile = await pgwApi.getProfile()

      if (!validateProfile(profile)) {
        await handleProfileError(new Error('Profile validation failed'))
        return false
      }

      // Store profile data
      cookie.value = JSON.stringify(profile.data)

      // Mark app as ready after checks
      setAppReady()

      return true
    } catch (error) {
      console.error('Error during app initialization:', error)
      // Redirect to profile error page on any profile-related error
      await handleProfileError(error)
      return false
    }
  }

  return {
    isAppReady: readonly(isAppReady),
    showSplash: readonly(showSplash),
    setAppReady,
    onSplashComplete,
    hideSplashScreen,
    checkAppReadiness,
  }
}
