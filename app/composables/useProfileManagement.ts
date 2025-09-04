/**
 * Profile Management Composable
 *
 * Handles profile switching and management functionality
 * for the Bill24 Payment Portal
 */

import type { SupplierProfile } from '~/models/supplier'
import { useMtcApi } from '~/composables/api/useMtcApi'
import { usePgwModuleApi } from './api/usePgwModuleApi'
import { useWalletStore } from '~/stores/wallet'

export const useProfileManagement = () => {
  const auth = useAuth()
  const { t } = useI18n()
  const toast = useToast()
  const { switchOrganization } = useMtcApi()
  const { getOrganizationList } = usePgwModuleApi()

  // Reactive state
  const availableProfiles = ref<SupplierProfile[]>([])
  const loadingProfiles = ref(false)

  /**
   * Load available profiles for the current user
   * Uses real API call to get organization list from MTC API
   */
  const loadAvailableProfiles = async (forceReload = false): Promise<void> => {
    if (availableProfiles.value.length > 0 && !forceReload) return // Already loaded

    try {
      loadingProfiles.value = true
      // Call the real API to get organization list
      const response = await getOrganizationList()

      if (response) {
        const tenantData: SupplierProfile[] = response.data

        // Filter out the current profile from available profiles
        availableProfiles.value = tenantData
      } else {
        throw new Error('Failed to load organizations')
      }
    } catch (error) {
      console.error('Failed to load available profiles:', error)
      toast.add({
        title: t('error.something_went_wrong'),
        description: 'Failed to load available profiles. Please try again.',
        color: 'error',
      })
    } finally {
      loadingProfiles.value = false
    }
  }

  /**
   * Switch to a different profile
   */
  const switchProfile = async (profile: SupplierProfile): Promise<void> => {
    try {
      // First, call the real API to switch organization on the server side
      console.log('Switching to profile:', profile.mappedData?.tenantId)
      const apiResponse = await switchOrganization({
        toTenantId: profile.mappedData?.tenantId ?? '',
      })

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to switch organization on server')
      }

      // Set the new profile locally (already in SupplierProfile format)
      auth.setProfileToCookie(profile)

      // Use the new app state manager for comprehensive cleanup
      const appStateManager = useAppStateManager()
      await appStateManager.performOrganizationSwitch()

      // Show success notification
      toast.add({
        title: t('success'),
        description: t('profile_popup.profile_switched') + `: ${profile.name}`,
        color: 'success',
      })

      availableProfiles.value = []
      await navigateTo('/')

    } catch (error) {
      console.error('Failed to switch profile:', error)
      toast.add({
        title: t('error.something_went_wrong'),
        description: error instanceof Error ? error.message : 'Failed to switch profile',
        color: 'error',
      })
    }
  }

  /**
   * Clear all application state and cached data after profile switch
   * @deprecated Use useAppStateManager().performOrganizationSwitch() instead
   */
  const clearApplicationState = async (): Promise<void> => {
    try {
      // 1. Clear localStorage items except essential ones
      const storage = useStorage()
      const keysToPreserve = [
        'user-preferences', // Keep user preferences
        'nuxt-oidc-auth', // Keep authentication data
      ]

      // Get all localStorage keys and clear organization-specific data
      const allKeys = storage.getKeys()
      allKeys.forEach((key) => {
        if (!keysToPreserve.some((preserveKey) => key.includes(preserveKey))) {
          storage.removeItem(key)
        }
      })

      // 2. Clear cached data patterns
      storage.clearItems('cache-')
      storage.clearItems('table-config')

      // 3. Reset Pinia stores
      const walletStore = useWalletStore()
      walletStore.resetStore()

      // 4. Clear any global reactive state
      // Note: Nuxt's useState will be reset on navigation

      console.log('✅ Application state cleared successfully after profile switch')
    } catch (error) {
      console.error('❌ Failed to clear application state:', error)
    }
  }

  /**
   * Refresh available profiles (clear cache and reload)
   */
  const refreshProfiles = (): void => {
    availableProfiles.value = []
    loadAvailableProfiles()
  }

  return {
    // State
    availableProfiles: readonly(availableProfiles),
    loadingProfiles: readonly(loadingProfiles),

    // Methods
    loadAvailableProfiles,
    switchProfile,
    refreshProfiles,
    clearApplicationState,
  }
}
