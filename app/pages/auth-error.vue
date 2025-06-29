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
            Authentication Error
          </h1>
        </div>

        <!-- Error Icon -->
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>

        <!-- Error Message -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-red-600 mb-3">
            {{ errorTitle }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ errorMessage }}
          </p>
          
          <!-- Error Details (if available) -->
          <div v-if="errorDetails" class="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 class="font-medium text-red-800 mb-2">Error Details:</h3>
            <p class="text-sm text-red-700">{{ errorDetails }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            @click="tryAgain"
            class="w-full bg-[#43B3DE] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7FCDE8] transition-colors"
          >
            Try Again
          </button>
          <button 
            @click="goHome"
            class="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Home Page
          </button>
          <button 
            @click="contactSupport"
            class="w-full text-[#43B3DE] py-2 px-6 font-medium hover:underline"
          >
            Contact Support
          </button>
        </div>

        <!-- Error Code (for support) -->
        <div v-if="errorCode" class="mt-6 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            Error Code: {{ errorCode }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta and head configuration
definePageMeta({
  layout: false,
  middleware: [],
  auth: false, // Allow access to error page without authentication
})

useHead({
  title: 'Authentication Error - Bill24 Admin Portal',
  meta: [
    { name: 'description', content: 'Authentication error occurred' }
  ]
})

// Query parameters
const route = useRoute()

// Error information
const errorType = computed(() => route.query.type as string || 'unknown')
const errorTitle = computed(() => {
  switch (errorType.value) {
    case 'access_denied':
      return 'Access Denied'
    case 'invalid_request':
      return 'Invalid Request'
    case 'server_error':
      return 'Server Error'
    case 'temporarily_unavailable':
      return 'Service Temporarily Unavailable'
    case 'unauthorized_client':
      return 'Unauthorized'
    case 'unsupported_response_type':
      return 'Configuration Error'
    default:
      return 'Authentication Failed'
  }
})

const errorMessage = computed(() => {
  switch (errorType.value) {
    case 'access_denied':
      return 'You do not have permission to access this application. Please contact your administrator.'
    case 'invalid_request':
      return 'The authentication request was invalid. Please try again.'
    case 'server_error':
      return 'An error occurred on the authentication server. Please try again later.'
    case 'temporarily_unavailable':
      return 'The authentication service is temporarily unavailable. Please try again in a few minutes.'
    case 'unauthorized_client':
      return 'This application is not authorized to perform authentication. Please contact support.'
    case 'unsupported_response_type':
      return 'There is a configuration issue with the authentication system. Please contact support.'
    default:
      return route.query.description as string || 'An unexpected error occurred during authentication. Please try again.'
  }
})

const errorDetails = computed(() => route.query.details as string || null)
const errorCode = computed(() => route.query.code as string || null)

// Actions
const tryAgain = () => {
  // Redirect to get-started to retry authentication
  navigateTo('/get-started')
}

const goHome = () => {
  // Clear any stored auth state and go home
  if (process.client) {
    sessionStorage.clear()
    localStorage.removeItem('keycloak-ready')
  }
  navigateTo('/')
}

const contactSupport = () => {
  // TODO: Implement actual support contact
  const subject = encodeURIComponent('Bill24 Admin Portal Authentication Error')
  const body = encodeURIComponent(`
Error Type: ${errorType.value}
Error Code: ${errorCode.value || 'N/A'}
Error Details: ${errorDetails.value || 'N/A'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}

Please describe what you were trying to do when this error occurred:

`)
  
  // Open email client (you can replace this with your support system)
  window.location.href = `mailto:support@bill24.com?subject=${subject}&body=${body}`
}

// Log error for debugging
onMounted(() => {
  console.error('🚨 Authentication error page loaded:', {
    type: errorType.value,
    details: errorDetails.value,
    code: errorCode.value,
    url: route.fullPath
  })
})
</script>
