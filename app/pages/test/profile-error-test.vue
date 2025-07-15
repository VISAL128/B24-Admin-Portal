<template>
  <div class="container mx-auto p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-[#211e1f] mb-6">
        {{ t('profile_error_test.title') }}
      </h1>

      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-[#211e1f] mb-4">
          {{ t('profile_error_test.current_status') }}
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="font-medium">{{ t('profile_error_test.profile_exists') }}</span>
            <span :class="profileExists ? 'text-green-600' : 'text-red-600'">
              {{ profileExists ? t('yes') : t('no') }}
            </span>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="font-medium">{{ t('profile_error_test.profile_valid') }}</span>
            <span :class="profileValid ? 'text-green-600' : 'text-red-600'">
              {{ profileValid ? t('yes') : t('no') }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-[#211e1f] mb-4">
          {{ t('profile_error_test.test_actions') }}
        </h2>

        <div class="space-y-3">
          <button
            class="w-full bg-[#3F83F8] hover:bg-[#3F83F8]/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            @click="testProfileError"
          >
            {{ t('profile_error_test.simulate_error') }}
          </button>

          <button
            class="w-full bg-gray-100 hover:bg-gray-200 text-[#211e1f] font-medium py-3 px-4 rounded-lg transition-all duration-200"
            @click="clearProfile"
          >
            {{ t('profile_error_test.clear_profile') }}
          </button>

          <button
            class="w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-all duration-200"
            @click="checkProfile"
          >
            {{ t('profile_error_test.check_profile') }}
          </button>
        </div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="font-semibold text-yellow-800 mb-2">
          {{ t('profile_error_test.note_title') }}
        </h3>
        <p class="text-yellow-700 text-sm">
          {{ t('profile_error_test.note_message') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { getValidatedProfile, handleProfileError, clearProfileData } = useProfileValidation()

// Reactive state
const profileExists = ref(false)
const profileValid = ref(false)

// Check profile status on mount
onMounted(() => {
  checkProfile()
})

// Methods
const checkProfile = () => {
  const profile = getValidatedProfile()
  profileExists.value = !!profile
  profileValid.value = !!profile
}

const testProfileError = async () => {
  await handleProfileError(new Error('Test profile error simulation'))
}

const clearProfile = () => {
  // Use the centralized profile clearing method
  clearProfileData()

  // Update the UI to reflect the change
  checkProfile()
}

// Page meta
definePageMeta({
  title: 'Profile Error Test',
  middleware: ['auth'],
})
</script>
