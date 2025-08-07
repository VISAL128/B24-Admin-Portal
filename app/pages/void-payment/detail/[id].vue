<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Page Header -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="material-symbols:receipt-long-outline" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Void Payment Details
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Transaction ID: {{ transactionId }}
        </p>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div class="text-center">
        <!-- Empty State Icon -->
        <div class="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="material-symbols:credit-card-off-outline" class="w-12 h-12 text-gray-300 dark:text-gray-600" />
        </div>
        
        <!-- Title -->
        <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-3">
          Void Payment
        </h2>
        
        <!-- Description -->
        <p class="text-gray-500 dark:text-gray-400 text-base mb-2">
          No data available for this void payment transaction.
        </p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">
          Void payment details will be displayed here when available.
        </p>
        
        <!-- Action Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <UButton
            variant="outline"
            icon="material-symbols:arrow-back"
            @click="goBack"
          >
            Go Back
          </UButton>
          <UButton
            variant="outline"
            icon="material-symbols:refresh"
            @click="refresh"
            :loading="isRefreshing"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Additional Info Card -->
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
      <div class="flex items-start space-x-3">
        <UIcon name="material-symbols:info-outline" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
            About Void Payments
          </h3>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Void payments are transactions that have been cancelled or reversed. 
            Once processed, the details and status will be available here.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'void_payment', to: '/void-payment' },
    { label: 'details', active: true },
  ],
})

const route = useRoute()
const router = useRouter()
const notification = useNotification()

const transactionId = computed(() => route.params.id as string)
const isRefreshing = ref(false)

// Go back to previous page
const goBack = () => {
  router.back()
}

// Refresh page data
const refresh = async () => {
  try {
    isRefreshing.value = true
    
    notification.showInfo({
      title: 'Refreshing',
      description: 'Checking for void payment data...',
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    notification.showInfo({
      title: 'No Data Available',
      description: 'No void payment data found for this transaction.',
    })
  } catch (error) {
    console.error('Error refreshing:', error)
    notification.showError({
      title: 'Refresh Failed',
      description: 'Failed to refresh void payment data. Please try again.',
    })
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
