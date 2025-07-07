<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      Notification System Test
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Toast Notifications</h2>
        </template>
        
        <div class="space-y-3">
          <UButton 
            @click="showSuccessNotification"
            color="success"
            variant="solid"
            block
          >
            Show Success Toast
          </UButton>
          
          <UButton 
            @click="showErrorNotification"
            color="error"
            variant="solid"
            block
          >
            Show Error Toast
          </UButton>
          
          <UButton 
            @click="showWarningNotification"
            color="warning"
            variant="solid"
            block
          >
            Show Warning Toast
          </UButton>
          
          <UButton 
            @click="showInfoNotification"
            color="info"
            variant="solid"
            block
          >
            Show Info Toast
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Server Error Simulation</h2>
        </template>
        
        <div class="space-y-3">
          <UButton 
            @click="simulateServerError(500)"
            color="error"
            variant="outline"
            block
          >
            Simulate 500 Error
          </UButton>
          
          <UButton 
            @click="simulateServerError(502)"
            color="error"
            variant="outline"
            block
          >
            Simulate 502 Error
          </UButton>
          
          <UButton 
            @click="simulateServerError(503)"
            color="error"
            variant="outline"
            block
          >
            Simulate 503 Error
          </UButton>
          
          <UButton 
            @click="simulateNetworkError"
            color="error"
            variant="outline"
            block
          >
            Simulate Network Error
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  breadcrumbs: [{ label: "Test", active: true }, { label: "Notifications", active: true }],
})

const notification = useNotification()
const errorHandler = useErrorHandler()
const { t } = useI18n()

const showSuccessNotification = () => {
  notification.showSuccess({
    title: t('success'),
    description: 'This is a success notification with Bill24 branding!'
  })
}

const showErrorNotification = () => {
  notification.showError({
    title: 'Operation Failed',
    description: 'This is an error notification. Something went wrong!'
  })
}

const showWarningNotification = () => {
  notification.showWarning({
    title: 'Warning',
    description: 'This is a warning notification. Please pay attention!'
  })
}

const showInfoNotification = () => {
  notification.showInfo({
    title: 'Information',
    description: 'This is an informational notification with useful details.'
  })
}

const simulateServerError = (statusCode: number) => {
  errorHandler.handleApiError({
    statusCode,
    statusMessage: `HTTP ${statusCode} Error`,
    message: `Simulated ${statusCode} server error for testing`
  })
}

const simulateNetworkError = () => {
  errorHandler.handleNetworkError()
}
</script>
