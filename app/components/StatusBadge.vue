<template>
  <span :class="`inline-block font-mono px-2 py-1 rounded text-xs ${statusClasses}`">
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  variant?: 'default' | 'table' | 'header'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

// Get status classes based on the status value
const statusClasses = computed(() => {
  const baseClasses = getStatusClasses(props.status)
  const sizeClasses = getSizeClasses(props.size)
  return `${baseClasses} ${sizeClasses}`
})

// Display text based on variant
const displayText = computed(() => {
  if (props.variant === 'table') {
    return props.status.toLowerCase()
  }
  return props.status
})

// Get color classes for different statuses
function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    case 'failed':
    case 'fail':
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    case 'unpaid':
    case 'pending':
    case 'warning':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'canceled':
    case 'cancelled':
    case 'expired':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    case 'reversed':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'processing':
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

// Get size classes
function getSizeClasses(size: string): string {
  switch (size) {
    case 'sm':
      return 'px-1.5 py-0.5 text-xs'
    case 'lg':
      return 'px-3 py-1.5 text-sm'
    default: // md
      return 'px-2 py-1 text-xs'
  }
}
</script>
