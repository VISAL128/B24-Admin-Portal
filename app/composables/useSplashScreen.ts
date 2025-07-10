import { usePgwModuleApi } from './api/usePgwModuleApi'

/**
 * Composable for managing splash screen state and functionality
 */
export const useSplashScreen = () => {
  const isAppReady = ref(false)
  const showSplash = ref(true)
  const pgwApi = usePgwModuleApi()

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

      // cookie.value = JSON.stringify({code: '1234'})
      // You can add additional readiness checks here
      console.log('App initialization complete, authenticated:', isAuthenticated.value)
      const profile = await pgwApi.getProfile()
      if (profile && profile.code === '000' && profile.data) {
        cookie.value = JSON.stringify(profile.data)
      }

      // Mark app as ready after checks
      setAppReady()

      return true
    } catch (error) {
      console.error('Error during app initialization:', error)
      // Still mark as ready to prevent infinite splash
      setAppReady()
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
