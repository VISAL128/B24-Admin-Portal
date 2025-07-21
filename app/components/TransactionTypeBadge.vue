<template>
  <UBadge :color="badgeColor" variant="soft" :size="size">
    {{ transactionType }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  transactionType: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

// Get badge color based on transaction type
const badgeColor = computed(() => {
  return getTransactionTypeBadgeColor(props.transactionType)
})

// Helper function to get transaction type badge color
function getTransactionTypeBadgeColor(
  type: string
): 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info' | 'neutral' {
  switch (type) {
    case 'Wallet Top up':
    case 'Wallet Topup':
    case 'Top up':
    case 'Topup':
      return 'info'
    case 'Deeplink / Checkout':
    case 'Deeplink':
    case 'Checkout':
      return 'primary'
    case 'Wallet Payment':
    case 'Payment':
      return 'success'
    case 'QR Pay':
    case 'QR Payment':
    case 'QR':
      return 'secondary'
    case 'Transfer':
    case 'Bank Transfer':
      return 'warning'
    case 'Refund':
      return 'error'
    case 'Subscription':
      return 'info'
    default:
      return 'neutral'
  }
}
</script>
