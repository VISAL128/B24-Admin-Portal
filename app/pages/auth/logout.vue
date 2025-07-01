<template>
  <div class="min-h-screen bg-gradient-to-b from-[#43B3DE] to-white flex items-center justify-center">
    <div class="max-w-md w-full mx-auto p-6">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img 
          src="/images/b24-logo-dark.png" 
          alt="Bill24 Logo" 
          class="h-12 w-auto mx-auto"
        />
        <h1 class="text-2xl font-bold text-gray-800 mt-4">
          Bill24 Admin Portal
        </h1>
      </div>

      <!-- Logout Processing Card -->
      <UCard class="shadow-xl">
        <div class="text-center p-6">
          <!-- Processing State -->
          <div v-if="isProcessingLogout" class="space-y-4">
            <LoadingSpinner />
            <h2 class="text-xl font-semibold text-gray-900">
              {{ t('logging_out') }}
            </h2>
            <p class="text-gray-600">
              {{ t('logging_out_message') }}
            </p>
          </div>

          <!-- Success State -->
          <div v-else-if="logoutSuccessful" class="space-y-4">
            <!-- Success Icon -->
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <Icon name="heroicons:check" class="h-8 w-8 text-green-600" />
            </div>
            
            <!-- Success Message -->
            <h2 class="text-xl font-semibold text-gray-900">
              {{ t('logout_successful') }}
            </h2>
            <p class="text-gray-600">
              {{ t('logout_successful_message') }}
            </p>

            <!-- Login Again Button -->
            <UButton 
              @click="handleLoginAgain"
              class="w-full bg-[#43B3DE] hover:bg-[#3A9BC1] text-white font-medium py-3 px-6 rounded-lg transition-colors mt-6"
              size="lg"
              :loading="isRedirecting"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
              {{ t('login_again') }}
            </UButton>
          </div>

          <!-- Error State -->
          <div v-else-if="logoutError" class="space-y-4">
            <!-- Error Icon -->
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <Icon name="heroicons:exclamation-triangle" class="h-8 w-8 text-red-600" />
            </div>
            
            <!-- Error Message -->
            <h2 class="text-xl font-semibold text-red-800">
              {{ t('logout_error') }}
            </h2>
            <p class="text-red-600 text-sm">
              {{ logoutError }}
            </p>

            <!-- Retry Button -->
            <UButton 
              @click="retryLogout"
              variant="outline"
              class="w-full mt-4"
              size="lg"
            >
              <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
              {{ t('try_again') }}
            </UButton>

            <!-- Login Button -->
            <UButton 
              @click="handleLoginAgain"
              class="w-full bg-[#43B3DE] hover:bg-[#3A9BC1] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              size="lg"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
              {{ t('go_to_login') }}
            </UButton>
          </div>

          <!-- Optional: Contact Support -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              {{ t('need_help') }} 
              <a href="mailto:support@bill24.com" class="text-[#43B3DE] hover:underline">
                {{ t('contact_support') }}
              </a>
            </p>
          </div>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500">
          © {{ new Date().getFullYear() }} Bill24. {{ t('all_rights_reserved') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

definePageMeta({
  layout: false,
  auth: false, // Allow access without authentication
})

useHead({
  title: 'Logout - Bill24 Admin Portal',
  meta: [
    { name: 'description', content: 'You have been logged out from Bill24 Admin Portal' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const { t } = useI18n()
const route = useRoute()
const oidc = useOidc()

// Reactive state
const isProcessingLogout = ref(true)
const logoutSuccessful = ref(false)
const logoutError = ref<string | null>(null)
const isRedirecting = ref(false)

// Get redirect URL from query parameters
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect && redirect !== '/auth/logout' ? redirect : '/auth/login'
})

// Clear all authentication data
const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...')
  
  if (process.client) {
    const storage = useStorage()
    
    // Clear all authentication-related localStorage
    const authKeys = [
      'keycloak-token',
      'keycloak-refresh-token', 
      'keycloak-id-token',
      'keycloak-user-profile',
      'authenticated-data'
    ]
    
    // Clear using storage composable
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      storage.removeItem(key)
    })
    
    // Double ensure removal with direct localStorage access
    authKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear session storage as well
    sessionStorage.clear()
    
    console.log('✅ All authentication data cleared')
  }
}

// Process logout
const processLogout = async () => {
  try {
    console.log('🚪 Processing logout...')
    
    // Clear local data first
    clearAllAuthData()
    
    // Use OIDC logout if user is logged in
    if (oidc.isLoggedIn) {
      console.log('🔄 Performing OIDC logout...')
      await oidc.logout(redirectUrl.value)
    } else {
      console.log('✅ User already logged out, showing success')
      isProcessingLogout.value = false
      logoutSuccessful.value = true
    }
    
  } catch (error) {
    console.error('❌ Logout failed:', error)
    logoutError.value = error instanceof Error ? error.message : 'Logout failed'
    isProcessingLogout.value = false
  }
}

// Retry logout
const retryLogout = async () => {
  logoutError.value = null
  isProcessingLogout.value = true
  logoutSuccessful.value = false
  await processLogout()
}

// Handle login again
const handleLoginAgain = async () => {
  try {
    isRedirecting.value = true
    console.log('🔄 Redirecting to login...')
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Navigate to login page
    await navigateTo('/auth/login', { replace: true })
  } catch (error) {
    console.error('❌ Login redirect failed:', error)
    isRedirecting.value = false
  }
}

// Handle OIDC logout completion
const handleLogoutComplete = () => {
  console.log('✅ Logout completed successfully')
  isProcessingLogout.value = false
  logoutSuccessful.value = true
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚪 Logout page mounted')
  
  // Check if user is already logged out
  if (!oidc.isLoggedIn) {
    console.log('✅ User already logged out')
    clearAllAuthData()
    isProcessingLogout.value = false
    logoutSuccessful.value = true
    return
  }
  
  // Process logout
  await processLogout()
})

// Watch for OIDC state changes
watch(() => oidc.isLoggedIn, (isLoggedIn) => {
  if (!isLoggedIn && isProcessingLogout.value) {
    handleLogoutComplete()
  }
})

onUnmounted(() => {
  console.log('👋 Logout page unmounted')
})
</script>

<style scoped>
/* Custom styles for loading animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
