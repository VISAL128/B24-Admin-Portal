<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#43B3DE] to-white"
  >
    <div
      class="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200"
    >
      <!-- Error Icon -->
      <div class="mb-6">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>

      <!-- Logo -->
      <!-- <div class="mb-6">
        <img src="/images/Bill24 logo.png" alt="Bill24 Logo" class="mx-auto h-12 w-auto" />
      </div> -->

      <!-- Error Title -->
      <h1 class="text-2xl font-bold text-[#211e1f] mb-4">
        {{ t('profile_error.title') }}
      </h1>

      <!-- Error Message -->
      <p class="text-[#211e1f]/80 mb-6 leading-relaxed">
        {{ t('profile_error.message') }}
      </p>

      <!-- Error Details -->
      <div class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-sm text-error font-medium mb-2">
          {{ t('profile_error.possible_reasons') }}
        </p>
        <ul class="text-sm text-error text-left list-disc list-inside space-y-1">
          <li>{{ t('profile_error.reason_1') }}</li>
          <li>{{ t('profile_error.reason_2') }}</li>
          <li>{{ t('profile_error.reason_3') }}</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <UButton
          :loading="isRetrying"
          variant="solid"
          size="lg"
          class="w-full justify-center"
          color="primary"
          @click="tryAgain"
        >
          {{ isRetrying ? t('profile_error.retrying') : t('profile_error.try_again') }}
        </UButton>

        <!-- <button
          class="w-full bg-gray-100 hover:bg-gray-200 text-[#211e1f] font-medium py-3 px-4 rounded-lg transition-all duration-200"
          @click="contactSupport"
        >
          {{ t('profile_error.contact_support') }}
        </button> -->
        <UButton
          variant="ghost"
          size="lg"
          class="w-full justify-center"
          color="error"
          @click="logout"
        >
          {{ t('profile_error.logout') }}
        </UButton>

        <!-- <button
          class="w-full text-[#211e1f]/60 hover:text-[#211e1f] font-medium py-2 transition-all duration-200"
          @click="logout"
        >
          {{ t('profile_error.logout') }}
        </button> -->
      </div>

      <!-- Additional Info -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <p class="text-xs text-[#211e1f]/50">
          {{ t('profile_error.support_info') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePgwModuleApi } from '~/composables/api/usePgwModuleApi'

const { t } = useI18n()
const { logout: authLogout, setProfileToCookie } = useAuth()
const pgwApi = usePgwModuleApi()
const { showError } = useNotification()
const handleError = useErrorHandler()

// Reactive state
const isRetrying = ref(false)

// Page meta
definePageMeta({
  layout: false,
  auth: false,
})

// Methods
const tryAgain = async () => {
  isRetrying.value = true

  try {
    // Wait a moment for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Retrying to fetch profile
    const profile = await pgwApi.getProfile()
    if (profile.code === '000' && profile.data) {
      // If profile is successfully fetched, set it in auth
      setProfileToCookie(profile.data)
      // Redirect to home or dashboard
      await navigateTo('/')
    } else {
      await showError({
        title: profile.code,
        description: profile.message,
        duration: 3000,
      })
    }
  } catch (error) {
    console.error('Error during retry:', error)
  } finally {
    isRetrying.value = false
  }
}

// const contactSupport = () => {
//   // You can customize this to open a support ticket system or email
//   window.open('mailto:support@bill24.com?subject=Profile%20Access%20Issue', '_blank')
// }

const logout = async () => {
  try {
    // The auth logout function now handles profile data cleanup automatically
    await authLogout()
  } catch (error) {
    handleError.handleApiError(error)
  }
}
</script>
