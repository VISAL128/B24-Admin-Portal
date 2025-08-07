<template>
  <div class="flex flex-col h-full w-full space-y-3">
    <!-- Page Header -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="material-symbols:receipt-long-outline" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Void Payments
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage and view void payment transactions
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
          No Void Payments Found
        </h2>
        
        <!-- Description -->
        <p class="text-gray-500 dark:text-gray-400 text-base mb-2">
          No void payment transactions are currently available.
        </p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">
          Void payment transactions will appear here when they become available.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  breadcrumbs: [
    { label: 'void_payment', active: true },
  ],
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
