/**
 * Profile Management Composable
 *
 * Handles profile switching and management functionality
 * for the Bill24 Payment Portal
 */

import type { SupplierProfile } from '~/models/supplier'
import { useMtcApi } from '~/composables/api/useMtcApi'
import { usePgwModuleApi } from './api/usePgwModuleApi'

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

        // Transform TenantAccess to SupplierProfile format
        const profiles: SupplierProfile[] = tenantData.map((tenant) => ({
          id: tenant.id,
          code: tenant.code,
          name: tenant.name,
          mappedRef: tenant.mappedRef || null,
        }))

        // Filter out the current profile from available profiles
        availableProfiles.value = profiles
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
      const apiResponse = await switchOrganization({
        toTenantId: profile.mappedRef ?? '',
      })

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to switch organization on server')
      }

      // Set the new profile locally (already in SupplierProfile format)
      auth.setProfileToCookie(profile)

      // Show success notification
      toast.add({
        title: t('success'),
        description: t('profile_popup.profile_switched') + `: ${profile.name}`,
        color: 'success',
      })

      // Clear the available profiles cache to force reload next time
      availableProfiles.value = []

      // Reload the page to refresh all profile-dependent data
      // TODO: In the future, we might want to implement a more elegant solution
      // that updates the reactive state without a full page reload
      // window.location.reload()
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
  }
}
