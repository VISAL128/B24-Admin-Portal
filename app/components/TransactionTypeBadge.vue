<template>
  <UBadge :color="badgeColor" variant="soft" :size="size">
    {{ formattedTransactionType }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TransactionType } from '~/utils/enumModel';

interface Props {
  transactionType: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

// Get badge color - using primary for all transaction types as requested
const badgeColor = computed(() => {
  return getTransactionTypeBadgeColor(props.transactionType)
})

// Format transaction type text from enum key to readable format
const formattedTransactionType = computed(() => {
  // Find the enum key that matches the value
  const enumKey = Object.entries(TransactionType).find(([key, value]) => value === props.transactionType)?.[0]
  
  if (enumKey) {
    // Convert camelCase to readable format (same as filter options)
    return enumKey.replace(/([A-Z])/g, ' $1').trim()
  }
  
  // Fallback to original value if not found in enum
  return props.transactionType
})

// Helper function to get transaction type badge color - now returns primary for all types
function getTransactionTypeBadgeColor(
  type: string
): 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info' | 'neutral' {
  // Return primary for all transaction types as requested
  return 'primary'
}
</script>
