<template>
  <div
    class="min-h-screen bg-gradient-to-b from-[#43B3DE] to-white flex items-center justify-center"
  >
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Bill24 Logo -->
        <div class="mb-8">
          <img src="/images/Bill24 logo.png" alt="Bill24 Logo" class="h-16 mx-auto mb-4" />
          <h1 class="text-2xl font-bold text-[#211e1f] mb-2">
            {{ t('no_permission.title') }}
          </h1>
        </div>

        <!-- Permission Denied Icon -->
        <div
          class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-10 h-10 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>

        <!-- Message -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-orange-600 mb-3">
            {{ permissionTitle }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ permissionMessage }}
          </p>

          <!-- Additional Info -->
          <div
            v-if="additionalInfo"
            class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left"
          >
            <h3 class="font-medium text-orange-800 mb-2">
              {{ t('no_permission.additional_info') }}
            </h3>
            <p class="text-sm text-orange-700">{{ additionalInfo }}</p>
          </div>

          <!-- Required Permissions -->
          <div
            v-if="requiredPermissions.length"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mt-4"
          >
            <h3 class="font-medium text-blue-800 mb-2">
              {{ t('no_permission.required_permissions') }}
            </h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li
                v-for="permission in requiredPermissions"
                :key="permission"
                class="flex items-center"
              >
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ permission }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="goBack"
            class="w-full bg-[#43B3DE] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7FCDE8] transition-colors"
          >
            {{ t('no_permission.go_back') }}
          </button>
          <button
            @click="goHome"
            class="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {{ t('no_permission.go_home') }}
          </button>
          <UButton @click="logout" variant="ghost">
            {{ t('no_permission.logout') }}
          </UButton>
          <button
            @click="requestAccess"
            class="w-full text-[#43B3DE] py-2 px-6 font-medium hover:underline"
          >
            {{ t('no_permission.request_access') }}
          </button>
        </div>

        <!-- User Info (for admin reference) -->
        <div v-if="userInfo" class="mt-6 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500 mb-1">
            {{ t('no_permission.user') }}: {{ userInfo.email || userInfo.username || 'Unknown' }}
          </p>
          <p v-if="userInfo.roles" class="text-xs text-gray-500 mb-1">
            {{ t('no_permission.current_roles') }}: {{ userInfo.roles.join(', ') }}
          </p>
          <p class="text-xs text-gray-500 mb-1">
            {{ t('no_permission.current_roles') }}:
            {{ useOidcAuth().user.value?.claims || 'Not available' }}
          </p>
          <p class="text-xs text-gray-500">{{ t('no_permission.request_id') }}: {{ requestId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import auth from '~/middleware/auth'

// Meta and head configuration
definePageMeta({
  layout: false,
  middleware: [],
  auth: false, // Allow access without authentication
})

useHead({
  title: 'Access Denied - Bill24 Payment Portal',
  meta: [{ name: 'description', content: 'You do not have permission to access this resource' }],
})

// Composables
const { t } = useI18n()
const route = useRoute()

// Permission information from query parameters
const permissionType = computed(() => (route.query.type as string) || 'general')
const resource = computed(() => route.query.resource as string)
const action = computed(() => route.query.action as string)
const additionalInfo = computed(() => (route.query.info as string) || null)

// Generate unique request ID for tracking
const requestId = computed(() => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `REQ-${timestamp}-${random}`
})

// User information (if available)
const userInfo = computed(() => {
  if (process.client) {
    try {
      const storedData = localStorage.getItem('user-info')
      return storedData ? JSON.parse(storedData) : null
    } catch {
      return null
    }
  }
  return null
})

// Required permissions from query
const requiredPermissions = computed(() => {
  const permissions = route.query.permissions as string
  return permissions ? permissions.split(',').map((p) => p.trim()) : []
})

// Dynamic titles and messages
const permissionTitle = computed(() => {
  switch (permissionType.value) {
    case 'role':
      return t('no_permission.insufficient_role')
    case 'feature':
      return t('no_permission.feature_restricted')
    case 'resource':
      return t('no_permission.resource_access_denied')
    case 'action':
      return t('no_permission.action_not_permitted')
    default:
      return t('no_permission.access_denied')
  }
})

const permissionMessage = computed(() => {
  const resourceText = resource.value ? ` "${resource.value}"` : ''
  const actionText = action.value ? ` (${action.value})` : ''

  switch (permissionType.value) {
    case 'role':
      return t('no_permission.role_message', { resource: resourceText })
    case 'feature':
      return t('no_permission.feature_message', { resource: resourceText })
    case 'resource':
      return t('no_permission.resource_message', { resource: resourceText, action: actionText })
    case 'action':
      return t('no_permission.action_message', {
        action: action.value || 'this action',
        resource: resourceText,
      })
    default:
      return t('no_permission.general_message')
  }
})

// Actions
const goBack = () => {
  // Try to go back in history, otherwise go to home
  if (process.client && window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

const goHome = () => {
  navigateTo('/')
}

const logout = () => {
  // Clear user info and redirect to login
  if (process.client) {
    localStorage.removeItem('user-info')
  }
  useAuth().logout()
}

const requestAccess = () => {
  // Prepare request access email
  const subject = encodeURIComponent('Bill24 Payment Portal - Access Request')
  const body = encodeURIComponent(`
Request Details:
- User: ${userInfo.value?.email || userInfo.value?.username || 'Unknown'}
- Current Roles: ${userInfo.value?.roles?.join(', ') || 'Not available'}
- Requested Resource: ${resource.value || 'Not specified'}
- Requested Action: ${action.value || 'Not specified'}
- Required Permissions: ${requiredPermissions.value.join(', ') || 'Not specified'}
- Request ID: ${requestId.value}
- Timestamp: ${new Date().toISOString()}
- Page: ${route.fullPath}

Reason for Access Request:
[Please describe why you need access to this resource]

Business Justification:
[Please provide business justification for this access]
`)

  // Open email client (you can replace this with your access request system)
  window.location.href = `mailto:admin@bill24.com?subject=${subject}&body=${body}`
}

// Log permission denial for audit purposes
onMounted(() => {
  console.warn('🚫 Permission denied page loaded:', {
    type: permissionType.value,
    resource: resource.value,
    action: action.value,
    user: userInfo.value?.email || userInfo.value?.username,
    roles: userInfo.value?.roles,
    requestId: requestId.value,
    timestamp: new Date().toISOString(),
    url: route.fullPath,
  })
})
</script>
