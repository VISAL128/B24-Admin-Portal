import { usePgwModuleApi } from './api/usePgwModuleApi'

/**
 * Composable for managing splash screen state and functionality
 */
export const useSplashScreen = () => {
  const isAppReady = ref(false)
  const showSplash = ref(true)
  const pgwApi = usePgwModuleApi()
  const { validateProfile, handleProfileError } = useProfileValidation()

  // Memoization to prevent multiple simultaneous calls
  let checkAppReadinessPromise: Promise<boolean> | null = null

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
  const checkAppReadiness: () => Promise<boolean> = async () => {
    // Return existing promise if already checking
    if (checkAppReadinessPromise) {
      return checkAppReadinessPromise
    }

    // Create new promise for this check
    checkAppReadinessPromise = (async () => {
      try {
        const cookie = useCookie('profile')
        // Check authentication state
        const { isAuthenticated } = useAuth()
        if (!isAuthenticated.value) {
          return false
        }

        if (cookie.value) {
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
        cookie.value = JSON.stringify(profile)

        // // Add any other initialization checks here
        // await nextTick()

        // Mark app as ready after checks
        setAppReady()

        return true
      } catch (error) {
        // Redirect to profile error page on any profile-related error
        await handleProfileError(error)
        return false
      } finally {
        // Clear the promise after completion
        checkAppReadinessPromise = null
      }
    })()

    return checkAppReadinessPromise
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
