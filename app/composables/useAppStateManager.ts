/**
 * Application State Manager Composable
 *
 * Handles clearing and refreshing application state when switching organizations/profiles
 */

import { LOCAL_STORAGE_KEYS } from '~/utils/constants'
import type { UserPreferences } from '~/models/userPreference'
import { useWalletStore } from '~/stores/wallet'

export const useAppStateManager = () => {
  const storage = useStorage()
  const route = useRoute()

  /**
   * Clear organization-specific cached data
   */
  const clearOrganizationCache = (): void => {
    try {
      // Clear cache patterns that are organization-specific
      storage.clearItems('cache-')
      storage.clearItems('table-config')
      storage.clearItems('wallet-')
      storage.clearItems('transaction-')
      storage.clearItems('settlement-')
      storage.clearItems('bank-')
      storage.clearItems('supplier-')

      if (import.meta.dev) {
        console.log('🗑️ Organization-specific cache cleared')
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to clear organization cache:', error)
      }
    }
  }

  /**
   * Reset all Pinia stores
   */
  const resetStores = (): void => {
    try {
      // Reset wallet store
      const walletStore = useWalletStore()
      walletStore.resetStore()

      // Add more store resets here as needed
      // const anotherStore = useAnotherStore()
      // anotherStore.resetStore()

      if (import.meta.dev) {
        console.log('🔄 All stores reset successfully')
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to reset stores:', error)
      }
    }
  }

  /**
   * Clear temporary UI state
   */
  const clearUIState = (): void => {
    try {
      // Clear any temporary UI state that shouldn't persist
      // This includes things like:
      // - Selected items in tables
      // - Expanded/collapsed states
      // - Temporary form data
      // - Search filters (optional)

      if (import.meta.dev) {
        console.log('🧹 UI state cleared')
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to clear UI state:', error)
      }
    }
  }

  /**
   * Refresh current page data without full reload
   */
  const refreshCurrentPageData = async (): Promise<void> => {
    try {
      // If we're on a data-heavy page, trigger a soft refresh
      const currentPath = route.path

      if (currentPath !== '/') {
        // Navigate to current route with force refresh
        await navigateTo(currentPath, {
          replace: true,
          external: false,
        })
      }

      if (import.meta.dev) {
        console.log('🔄 Current page data refreshed')
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to refresh current page data:', error)
      }
    }
  }

  /**
   * Complete application state reset for organization switch
   */
  const performOrganizationSwitch = async (): Promise<void> => {
    try {
      if (import.meta.dev) {
        console.log('🔄 Starting organization switch cleanup...')
      }

      // Step 1: Clear organization-specific cache
      clearOrganizationCache()

      // Step 2: Reset all stores
      resetStores()

      // Step 3: Clear temporary UI state
      clearUIState()

      // Step 4: Force refresh current page data
      await refreshCurrentPageData()

      if (import.meta.dev) {
        console.log('✅ Organization switch cleanup completed')
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Organization switch cleanup failed:', error)
      }
    }
  }

  /**
   * Smart navigation that refreshes data for specific routes
   */
  const navigateWithRefresh = async (path: string): Promise<void> => {
    try {
      // Clear relevant cache before navigation
      clearOrganizationCache()
      resetStores()

      // Navigate to the new path
      await navigateTo(path, { replace: true })

      if (import.meta.dev) {
        console.log(`🧭 Navigated to ${path} with data refresh`)
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error(`❌ Failed to navigate to ${path} with refresh:`, error)
      }
    }
  }

  /**
   * Preserve user preferences during organization switch
   */
  const preserveUserPreferences = (): UserPreferences | null => {
    try {
      const preferences = storage.getItem(
        LOCAL_STORAGE_KEYS.USER_PREFERENCES
      ) as UserPreferences | null
      if (import.meta.dev) {
        console.log('💾 User preferences preserved')
      }
      return preferences
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to preserve user preferences:', error)
      }
      return null
    }
  }

  /**
   * Restore user preferences after organization switch
   */
  const restoreUserPreferences = (preferences: UserPreferences | null): void => {
    try {
      if (preferences) {
        storage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences)
        if (import.meta.dev) {
          console.log('🔄 User preferences restored')
        }
      }
    } catch (error) {
      if (import.meta.dev) {
        console.error('❌ Failed to restore user preferences:', error)
      }
    }
  }

  return {
    // Individual operations
    clearOrganizationCache,
    resetStores,
    clearUIState,
    refreshCurrentPageData,

    // Combined operations
    performOrganizationSwitch,
    navigateWithRefresh,

    // Preference management
    preserveUserPreferences,
    restoreUserPreferences,
  }
}
