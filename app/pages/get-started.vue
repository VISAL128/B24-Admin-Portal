<template>
  <div class="min-h-screen bg-gradient-to-b from-[#43B3DE] to-white flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Bill24 Logo -->
        <div class="mb-8">
          <img 
            src="/images/Bill24 logo.png" 
            alt="Bill24 Logo" 
            class="h-16 mx-auto mb-4"
          >
          <h1 class="text-2xl font-bold text-[#211e1f] mb-2">
            Welcome to Bill24 Admin Portal
          </h1>
          <p class="text-gray-600">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <LoadingSpinner />
          <p class="text-sm text-gray-500">
            {{ loadingMessage }}
          </p>
        </div>

        <!-- Success State -->
        <div v-else-if="isAuthenticated && !authError" class="space-y-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-[#211e1f] mb-2">
            Authentication Successful!
          </h2>
          <p class="text-gray-600 mb-4">
            Welcome, {{ userDisplayName }}!
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Redirecting to portal...
          </p>
          <div class="space-y-2">
            <button 
              @click="continueToPortal"
              class="w-full bg-[#43B3DE] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7FCDE8] transition-colors"
            >
              Continue Now
            </button>
            <button 
              @click="handleLogout"
              class="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Unauthenticated State -->
        <div v-else-if="!isAuthenticated && !authError" class="space-y-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-[#211e1f] mb-2">
            Authentication Required
          </h2>
          <p class="text-gray-600 mb-4">
            Please sign in to access the admin portal.
          </p>
          <div class="space-y-2">
            <button 
              @click="initiateLogin"
              class="w-full bg-[#43B3DE] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7FCDE8] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="authError" class="space-y-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p class="text-gray-600 mb-4">
            {{ authError }}
          </p>
          <div class="space-y-2">
            <button 
              @click="retryAuthentication"
              class="w-full bg-[#43B3DE] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7FCDE8] transition-colors"
            >
              Try Again
            </button>
            <button 
              @click="clearAndRetry"
              class="w-full bg-orange-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Clear Data & Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Debug Info (Development Only) -->
      <div v-if="isDevelopment && showDebugInfo" class="mt-4 bg-gray-100 rounded-lg p-4 text-xs">
        <h3 class="font-semibold text-gray-700 mb-2">Debug Information</h3>
        <pre class="text-gray-600 whitespace-pre-wrap">{{ debugInfo }}</pre>
        <button 
          @click="showDebugInfo = false"
          class="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Hide Debug Info
        </button>
      </div>
      
      <!-- Debug Toggle (Development Only) -->
      <div v-if="isDevelopment && !showDebugInfo" class="mt-4 text-center">
        <button 
          @click="showDebugInfo = true"
          class="text-xs text-gray-500 hover:text-gray-700"
        >
          Show Debug Info
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

// Meta and head configuration
definePageMeta({
  layout: false,
  middleware: [],
  auth: false, // Allow access to this page without authentication
})

useHead({
  title: 'Get Started - Bill24 Admin Portal',
  meta: [
    { name: 'description', content: 'Setting up your Bill24 Admin Portal account' }
  ]
})

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

// OIDC and Auth composables
const oidc = useOidc()
const { navigateToDashboard } = useAuthNavigation()
const { logout } = useAuth()

// Reactive state
const isLoading = ref(false)
const authError = ref<string | null>(null)
const loadingMessage = ref('Initializing...')
const showDebugInfo = ref(false)

// Computed properties
const isAuthenticated = computed(() => oidc.isLoggedIn)

const userDisplayName = computed(() => {
  if (!oidc.user) return 'User'
  
  if (oidc.user.given_name && oidc.user.family_name) {
    return `${oidc.user.given_name} ${oidc.user.family_name}`
  }
  
  return oidc.user.preferred_username || oidc.user.email || 'Admin'
})

const statusMessage = computed(() => {
  if (isLoading.value) return 'Processing authentication...'
  if (authError.value) return 'Authentication error occurred'
  if (isAuthenticated.value) return 'Authentication successful!'
  return 'Ready to sign in'
})

// Debug information for development
const debugInfo = computed(() => {
  if (!isDevelopment) return ''
  
  return JSON.stringify({
    // Authentication state
    isAuthenticated: isAuthenticated.value,
    user: oidc.user,
    isLoggedIn: oidc.isLoggedIn,
    
    // Component state
    isLoading: isLoading.value,
    authError: authError.value,
    loadingMessage: loadingMessage.value,
    
    // URL information
    url: process.client ? window.location.href : 'N/A',
    urlParams: process.client ? Object.fromEntries(new URLSearchParams(window.location.search)) : {},
    
    // Storage info
    localStorageKeys: process.client ? Object.keys(localStorage).filter(key => 
      Object.values(LOCAL_STORAGE_KEYS).includes(key)
    ) : [],
    
    // Environment
    timestamp: new Date().toISOString()
  }, null, 2)
})

// Clear authentication data helper
const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...')
  
  // Clear localStorage items
  const storage = useStorage()
  Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
    storage.removeItem(key)
  })
  
  console.log('✅ Authentication data cleared')
}

// Authentication actions
const initiateLogin = async () => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Redirecting to login...'
    authError.value = null
    
    console.log('🔐 Initiating login...')
    
    // Use the login endpoint with return URL
    const returnUrl = new URLSearchParams(window.location.search).get('redirect') || '/'
    await navigateTo(`/login?redirect=${encodeURIComponent(returnUrl)}`, { 
      external: false,
      replace: true 
    })
    
  } catch (error) {
    console.error('❌ Login initiation failed:', error)
    authError.value = error instanceof Error ? error.message : 'Login failed'
    isLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Logging out...'
    authError.value = null
    
    console.log('🚪 Logging out...')
    
    // Clear local data first
    clearAllAuthData()
    
    // Perform OIDC logout
    await logout()
    
    // Reset state
    isLoading.value = false
    loadingMessage.value = 'Logged out successfully'
    
    console.log('✅ Logout completed')
    
  } catch (error) {
    console.error('❌ Logout failed:', error)
    authError.value = error instanceof Error ? error.message : 'Logout failed'
    isLoading.value = false
    
    // Clear data even if logout fails
    clearAllAuthData()
  }
}

const continueToPortal = async () => {
  try {
    console.log('🏠 Navigating to portal...')
    
    // Check for redirect URL in query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const redirectUrl = urlParams.get('redirect')
    
    if (redirectUrl && redirectUrl !== '/' && redirectUrl !== '/get-started') {
      await navigateTo(redirectUrl, { replace: true })
    } else {
      await navigateToDashboard()
    }
  } catch (error) {
    console.error('❌ Navigation failed:', error)
    authError.value = 'Navigation failed'
  }
}

const retryAuthentication = async () => {
  console.log('🔄 Retrying authentication...')
  
  // Reset state
  authError.value = null
  isLoading.value = false
  
  // Check current authentication status
  if (isAuthenticated.value) {
    await continueToPortal()
  } else {
    await initiateLogin()
  }
}

const clearAndRetry = async () => {
  console.log('🧹 Clearing data and retrying...')
  
  isLoading.value = true
  loadingMessage.value = 'Clearing data...'
  authError.value = null
  
  // Clear all data
  clearAllAuthData()
  
  // Try logout to clear server-side session
  try {
    await logout()
  } catch (error) {
    console.warn('Logout failed during clear, continuing...', error)
  }
  
  // Short delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Reset and retry
  isLoading.value = false
  await initiateLogin()
}

// Auto-redirect logic for authenticated users
const handleAuthenticatedUser = async () => {
  if (isAuthenticated.value && !authError.value) {
    console.log('✅ User already authenticated, auto-redirecting...')
    
    // Auto-redirect after a brief delay
    setTimeout(async () => {
      await continueToPortal()
    }, 2000)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 Get Started page mounted')
  console.log('🔍 Authentication status:', isAuthenticated.value)
  
  // Handle already authenticated users
  if (isAuthenticated.value) {
    await handleAuthenticatedUser()
  }
  
  // Enable debug info in development after a delay
  if (isDevelopment) {
    setTimeout(() => {
      showDebugInfo.value = false // Start with debug hidden
    }, 1000)
  }
})

onUnmounted(() => {
  console.log('👋 Get Started page unmounted')
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
