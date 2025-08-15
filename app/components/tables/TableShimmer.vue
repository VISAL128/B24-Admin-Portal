<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Table Header Shimmer -->
    <div class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div class="flex items-center px-4 py-3">
        <!-- Row Number Column -->
        <div v-if="showRowNumber" class="w-12 mr-4">
          <div class="h-4 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        
        <!-- Data Columns -->
        <div class="flex-1 grid grid-cols-5 gap-4">
          <div v-for="i in 5" :key="i" class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Table Rows Shimmer -->
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <div 
        v-for="row in rows" 
        :key="row" 
        class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center">
          <!-- Row Number Column -->
          <div v-if="showRowNumber" class="w-12 mr-4">
            <div class="h-4 w-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          
          <!-- Data Columns -->
          <div class="flex-1 grid grid-cols-5 gap-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div class="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Shimmer -->
    <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number
  showRowNumber?: boolean
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  showRowNumber: true,
})
</script>
