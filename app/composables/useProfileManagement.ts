/**
 * Profile Management Composable
 *
 * Handles profile switching and management functionality
 * for the Bill24 Payment Portal
 */

import type { SupplierProfile } from '~/models/supplier'

export const useProfileManagement = () => {
  const auth = useAuth()
  const { t } = useI18n()
  const toast = useToast()

  // Reactive state
  const availableProfiles = ref<SupplierProfile[]>([])
  const loadingProfiles = ref(false)

  /**
   * Load available profiles for the current user
   * TODO: Replace with actual API call when backend is ready
   */
  const loadAvailableProfiles = async (forceReload = false): Promise<void> => {
    if (availableProfiles.value.length > 0 && !forceReload) return // Already loaded

    try {
      loadingProfiles.value = true

      // TODO: Replace with actual API call
      // const response = await $fetch('/api/user/profiles')

      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

      const mockProfiles: SupplierProfile[] = [
        {
          id: 'profile-1',
          code: 'EV001',
          name: 'EV Charging Station Alpha',
        },
        {
          id: 'profile-2',
          code: 'EV002',
          name: 'EV Charging Station Beta',
        },
        {
          id: 'profile-3',
          code: 'EV003',
          name: 'EV Charging Station Gamma',
        },
        {
          id: 'profile-4',
          code: 'PAY001',
          name: 'Payment Gateway Services',
        },
        {
          id: 'profile-5',
          code: 'BIL001',
          name: 'Bill24 Main Services',
        },
      ]

      // Filter out the current profile from available profiles
      availableProfiles.value = mockProfiles.filter(
        (profile) => profile.id !== auth.currentProfile.value?.id
      )
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
      // Set the new profile
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
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch profile:', error)
      toast.add({
        title: t('error.something_went_wrong'),
        description: 'Failed to switch profile',
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
