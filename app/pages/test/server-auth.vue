<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ t('test.server_auth.title') }}
        </h1>
        <p class="text-gray-600">
          {{ t('test.server_auth.description') }}
        </p>
      </div>

      <!-- Authentication Status -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ t('test.server_auth.auth_status') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="p-4 rounded-lg"
            :class="
              authStatus.isAuthenticated
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            "
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UIcon
                  :name="
                    authStatus.isAuthenticated ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                  "
                  :class="authStatus.isAuthenticated ? 'text-green-500' : 'text-red-500'"
                  size="20"
                />
              </div>
              <div class="ml-3">
                <p
                  class="text-sm font-medium"
                  :class="authStatus.isAuthenticated ? 'text-green-800' : 'text-red-800'"
                >
                  {{
                    authStatus.isAuthenticated
                      ? t('test.server_auth.authenticated')
                      : t('test.server_auth.not_authenticated')
                  }}
                </p>
                <p
                  class="text-xs"
                  :class="authStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'"
                >
                  {{ authStatus.username || t('test.server_auth.anonymous_user') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Tests -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ t('test.server_auth.api_tests') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Health Check -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">{{ t('test.server_auth.health_check') }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ t('test.server_auth.health_description') }}</p>
            <UButton
              @click="testHealth"
              :loading="loading.health"
              size="sm"
              color="primary"
              class="w-full"
            >
              {{ t('test.server_auth.test_api') }}
            </UButton>
            <div v-if="results.health" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.health, null, 2) }}</pre>
            </div>
          </div>

          <!-- User Profile -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">{{ t('test.server_auth.user_profile') }}</h3>
            <p class="text-sm text-gray-600 mb-3">
              {{ t('test.server_auth.profile_description') }}
            </p>
            <UButton
              @click="testProfile"
              :loading="loading.profile"
              size="sm"
              color="success"
              class="w-full"
            >
              {{ t('test.server_auth.test_api') }}
            </UButton>
            <div v-if="results.profile" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.profile, null, 2) }}</pre>
            </div>
          </div>

          <!-- Suppliers -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">{{ t('test.server_auth.suppliers') }}</h3>
            <p class="text-sm text-gray-600 mb-3">
              {{ t('test.server_auth.suppliers_description') }}
            </p>
            <UButton
              @click="testSuppliers"
              :loading="loading.suppliers"
              size="sm"
              color="secondary"
              class="w-full"
            >
              {{ t('test.server_auth.test_api') }}
            </UButton>
            <div v-if="results.suppliers" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.suppliers, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Settlement Operations -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ t('test.server_auth.settlement_operations') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Read Operations -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              {{ t('test.server_auth.read_settlements') }}
            </h3>
            <p class="text-sm text-gray-600 mb-3">{{ t('test.server_auth.read_description') }}</p>
            <UButton
              @click="testSettlementRead"
              :loading="loading.settlementRead"
              size="sm"
              color="primary"
              class="w-full"
            >
              {{ t('test.server_auth.test_read') }}
            </UButton>
            <div v-if="results.settlementRead" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.settlementRead, null, 2) }}</pre>
            </div>
          </div>

          <!-- Write Operations -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              {{ t('test.server_auth.create_settlements') }}
            </h3>
            <p class="text-sm text-gray-600 mb-3">{{ t('test.server_auth.write_description') }}</p>
            <UButton
              @click="testSettlementWrite"
              :loading="loading.settlementWrite"
              size="sm"
              color="success"
              class="w-full"
            >
              {{ t('test.server_auth.test_write') }}
            </UButton>
            <div v-if="results.settlementWrite" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.settlementWrite, null, 2) }}</pre>
            </div>
          </div>

          <!-- Execute Operations -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              {{ t('test.server_auth.execute_settlements') }}
            </h3>
            <p class="text-sm text-gray-600 mb-3">
              {{ t('test.server_auth.execute_description') }}
            </p>
            <UButton
              @click="testSettlementExecute"
              :loading="loading.settlementExecute"
              size="sm"
              color="warning"
              class="w-full"
            >
              {{ t('test.server_auth.test_execute') }}
            </UButton>
            <div v-if="results.settlementExecute" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.settlementExecute, null, 2) }}</pre>
            </div>
          </div>

          <!-- Delete Operations -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">
              {{ t('test.server_auth.delete_settlements') }}
            </h3>
            <p class="text-sm text-gray-600 mb-3">{{ t('test.server_auth.delete_description') }}</p>
            <UButton
              @click="testSettlementDelete"
              :loading="loading.settlementDelete"
              size="sm"
              color="error"
              class="w-full"
            >
              {{ t('test.server_auth.test_delete') }}
            </UButton>
            <div v-if="results.settlementDelete" class="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{{ JSON.stringify(results.settlementDelete, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Page configuration
definePageMeta({
  title: 'Server Auth Test',
  middleware: ['auth'], // Require authentication to access this page
})

// Composables
const { t } = useI18n()
const auth = useAuth()
const notification = useNotification()

// Reactive state
const loading = ref({
  health: false,
  profile: false,
  suppliers: false,
  settlementRead: false,
  settlementWrite: false,
  settlementExecute: false,
  settlementDelete: false,
})

const results = ref({
  health: null as any,
  profile: null as any,
  suppliers: null as any,
  settlementRead: null as any,
  settlementWrite: null as any,
  settlementExecute: null as any,
  settlementDelete: null as any,
})

// Computed
const authStatus = computed(() => ({
  isAuthenticated: auth.isAuthenticated.value,
  username: auth.user.value?.username || null,
}))

// Methods
const handleApiTest = async (testName: keyof typeof loading.value, apiCall: () => Promise<any>) => {
  loading.value[testName] = true
  results.value[testName] = null

  try {
    const result = await apiCall()
    results.value[testName] = result

    notification.showSuccess({
      title: t('test.server_auth.test_success'),
      description: t('test.server_auth.api_success', { api: testName }),
    })
  } catch (error: any) {
    results.value[testName] = {
      error: true,
      message: error.message || 'Unknown error',
      statusCode: error.statusCode || 500,
      data: error.data || null,
    }

    notification.showError({
      title: t('test.server_auth.test_failed'),
      description: error.message || t('test.server_auth.api_error', { api: testName }),
    })
  } finally {
    loading.value[testName] = false
  }
}

// API test methods using existing server endpoints and API composables
const testHealth = () =>
  handleApiTest('health', async () => {
    const response = await $fetch('/api/health')
    return response
  })

const testProfile = () =>
  handleApiTest('profile', async () => {
    const response = await $fetch('/api/user/profile')
    return response
  })

const testSuppliers = () =>
  handleApiTest('suppliers', async () => {
    const response = await $fetch('/api/suppliers')
    return response
  })

const testSettlementRead = () =>
  handleApiTest('settlementRead', async () => {
    const response = await $fetch('/api/settlement-history', {
      method: 'GET',
      query: { page: 1, limit: 10 },
    })
    return response
  })

const testSettlementWrite = () =>
  handleApiTest('settlementWrite', async () => {
    const response = await $fetch('/api/submit-settlement', {
      method: 'POST',
      body: {
        name: 'Test Settlement',
        amount: 1000,
        currency: 'KHR',
      },
    })
    return response
  })

const testSettlementExecute = () =>
  handleApiTest('settlementExecute', async () => {
    const response = await $fetch('/api/inquiry-settlement', {
      method: 'POST',
      body: {
        id: 'test-settlement-123',
      },
    })
    return response
  })

const testSettlementDelete = () =>
  handleApiTest('settlementDelete', async () => {
    // Note: This is a test endpoint, actual delete functionality may differ
    const response = await $fetch('/api/settlement/operations', {
      method: 'DELETE',
      query: { id: 'test-settlement-123' },
    })
    return response
  })

// Lifecycle
onMounted(() => {
  console.log('🧪 Server Auth Test Page loaded')
  console.log('Authentication status:', authStatus.value)
})
</script>
