import { usePgwModuleApi } from './api/usePgwModuleApi'
import { useUserPreferences } from './utils/useUserPreferences'

/**
 * Composable for managing splash screen state and functionality
 */
export const useSplashScreen = () => {
  const isAppReady = ref(false)
  const showSplash = ref(true)
  const currentStep = ref('loading_app')
  const progress = ref(0)
  const pgwApi = usePgwModuleApi()
  const { validateProfile, handleProfileError } = useProfileValidation()

  // Memoization to prevent multiple simultaneous calls
  let checkAppReadinessPromise: Promise<boolean> | null = null

  /**
   * Update progress step and percentage
   */
  const updateProgress = (step: string, progressValue: number) => {
    currentStep.value = step
    progress.value = progressValue
  }

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
        // Step 1: Initialize
        updateProgress('loading_app', 10)
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Step 2: Check authentication
        updateProgress('checking_auth', 25)
        const { isAuthenticated } = useAuth()
        if (!isAuthenticated.value) {
          return false
        }

        // Step 2.5: Ensure user preferences are loaded
        updateProgress('loading_preferences', 30)
        const preferences = useUserPreferences().getPreferences()
        if (!preferences) {
          // Set default preferences if none exist
          useUserPreferences().savePreferences(DEFAULT_USER_PREFERENCES)
        } else {
          // Ensure all default preferences are set
          let preferencesUpdated = false
          for (const key in DEFAULT_USER_PREFERENCES) {
            if (!(key in preferences)) {
              preferences[key] = DEFAULT_USER_PREFERENCES[key]
              preferencesUpdated = true
            }
          }
          if (preferencesUpdated) {
            useUserPreferences().savePreferences(preferences)
          }
        }

        // Step 3: Check for existing profile
        updateProgress('loading_profile', 40)
        const cookie = useCookie('profile')
        // if (cookie.value) {
        //   // Step 6: Finalize if profile exists
        //   updateProgress('finalizing', 90)
        //   await new Promise((resolve) => setTimeout(resolve, 100))

        //   updateProgress('complete', 100)
        //   setAppReady()
        //   return true
        // }

        // Step 4: Get user profile from API
        let profile
        try {
          profile = await pgwApi.getProfile()

          // Check if profile was returned
          if (!profile) {
            console.error('No profile returned from API')
            hideSplashScreen()
            await handleProfileError(new Error('No profile available'))
            return false
          }

          // Only proceed to step 5 after API response is received
          updateProgress('validating_profile', 70)
          await new Promise((resolve) => setTimeout(resolve, 100))

          if (!validateProfile(profile)) {
            hideSplashScreen()
            await handleProfileError(new Error('Profile validation failed'))
            return false
          }

          // Store profile data
          cookie.value = JSON.stringify(profile)
        } catch (profileError) {
          // Handle profile API errors specifically
          console.error('Profile API error:', profileError)
          hideSplashScreen()
          await handleProfileError(profileError)
          return false
        }

        // Step 6: Load preferences (simulated)
        updateProgress('loading_preferences', 85)
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Step 7: Finalize
        updateProgress('finalizing', 95)
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Step 8: Complete
        updateProgress('complete', 100)
        setAppReady()

        return true
      } catch (error) {
        // Redirect to profile error page on any profile-related error
        console.error('General error during app initialization:', error)
        hideSplashScreen()
        await handleProfileError(error)
        return false
      } finally {
        // Clear the promise only after this execution completes
        checkAppReadinessPromise = null
      }
    })()

    // Return the promise directly
    return checkAppReadinessPromise
  }
  return {
    isAppReady: readonly(isAppReady),
    showSplash: readonly(showSplash),
    currentStep: readonly(currentStep),
    progress: readonly(progress),
    setAppReady,
    onSplashComplete,
    hideSplashScreen,
    checkAppReadiness,
  }
}
