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
        <p class="text-gray-600 mt-2">
          {{ t('welcome') }}
        </p>
      </div>

      <!-- Login Card -->
      <UCard class="shadow-xl">
        <div class="p-6">
          <!-- Status Display -->
          <div class="text-center mb-6">
            <div v-if="isLoading" class="space-y-4">
              <LoadingSpinner />
              <p class="text-gray-600">{{ loadingMessage }}</p>
            </div>
            
            <div v-else-if="authError" class="space-y-4">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <Icon name="heroicons:exclamation-triangle" class="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-red-800 mb-2">
                  {{ t('authentication_error') }}
                </h3>
                <p class="text-red-600 text-sm">{{ authError }}</p>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#43B3DE]/10">
                <Icon name="heroicons:shield-check" class="h-8 w-8 text-[#43B3DE]" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                  {{ t('secure_login') }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ t('secure_login_description') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Login Button -->
          <UButton 
            @click="handleLogin"
            :loading="isLoading"
            :disabled="isLoading"
            class="w-full bg-[#43B3DE] hover:bg-[#3A9BC1] text-white font-medium py-3 px-6 rounded-lg transition-colors"
            size="lg"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
            {{ isLoading ? loadingMessage : t('sign_in') }}
          </UButton>

          <!-- Retry Button (shown on error) -->
          <UButton 
            v-if="authError"
            @click="retryLogin"
            variant="outline"
            class="w-full mt-3"
            size="lg"
          >
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
            {{ t('try_again') }}
          </UButton>

          <!-- Development Debug Info -->
          <div v-if="isDevelopment && showDebugInfo" class="mt-6 p-4 bg-gray-100 rounded-lg">
            <details>
              <summary class="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Debug Information
              </summary>
              <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ debugInfo }}</pre>
            </details>
          </div>

          <!-- Toggle Debug Info (Development Only) -->
          <div v-if="isDevelopment" class="mt-4 text-center">
            <button 
              @click="showDebugInfo = !showDebugInfo"
              class="text-xs text-gray-500 hover:text-gray-700"
            >
              {{ showDebugInfo ? 'Hide' : 'Show' }} Debug Info
            </button>
          </div>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500">
          {{ t('need_help') }} 
          <a href="mailto:support@bill24.com" class="text-[#43B3DE] hover:underline">
            {{ t('contact_support') }}
          </a>
        </p>
        <p class="text-xs text-gray-400 mt-2">
          © {{ new Date().getFullYear() }} Bill24. {{ t('all_rights_reserved') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false, // Allow access without authentication
})

useHead({
  title: 'Sign In - Bill24 Admin Portal',
  meta: [
    { name: 'description', content: 'Sign in to Bill24 Admin Portal' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const { t } = useI18n()
const route = useRoute()
const oidc = useOidc()

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

// Reactive state
const isLoading = ref(false)
const authError = ref<string | null>(null)
const loadingMessage = ref('Initializing...')
const showDebugInfo = ref(false)

// Get redirect URL from query parameters
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect && redirect !== '/auth/login' ? redirect : '/'
})

// Debug information for development
const debugInfo = computed(() => {
  if (!isDevelopment) return ''
  
  return JSON.stringify({
    // Route information
    path: route.path,
    query: route.query,
    redirectUrl: redirectUrl.value,
    
    // OIDC state
    isLoggedIn: oidc.isLoggedIn,
    
    // Component state
    isLoading: isLoading.value,
    authError: authError.value,
    loadingMessage: loadingMessage.value,
    
    // Environment
    timestamp: new Date().toISOString()
  }, null, 2)
})

// Check if user is already authenticated
const checkAuthStatus = () => {
  if (oidc.isLoggedIn) {
    console.log('✅ User already authenticated, redirecting...')
    navigateTo(redirectUrl.value, { replace: true })
    return true
  }
  return false
}

// Handle login initiation
const handleLogin = async () => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Redirecting to login...'
    authError.value = null
    
    console.log('🔐 Initiating OIDC login...')
    console.log('📍 Redirect URL:', redirectUrl.value)
    
    // Use the OIDC module's built-in login method
    await oidc.login(redirectUrl.value)
    
  } catch (error) {
    console.error('❌ Login initiation failed:', error)
    authError.value = error instanceof Error ? error.message : 'Login failed to initiate'
    isLoading.value = false
    loadingMessage.value = 'Ready to try again'
  }
}

// Retry login
const retryLogin = async () => {
  authError.value = null
  await handleLogin()
}

// Lifecycle hooks
onMounted(() => {
  console.log('🔐 Login page mounted')
  console.log('📍 Redirect URL:', redirectUrl.value)
  
  // Check if user is already authenticated
  if (checkAuthStatus()) {
    return
  }
  
  // Auto-initiate login if no errors
  // if (!authError.value) {
  //   console.log('🚀 Auto-initiating login...')
  //   handleLogin()
  // }
})

onUnmounted(() => {
  console.log('👋 Login page unmounted')
})
</script>

<style scoped>
/* Custom styles for animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
