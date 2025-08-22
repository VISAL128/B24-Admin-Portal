<template>
  <UBadge :label="displayText" :color="statusColor" :variant="variant" :size="props.size" class="justify-center min-w-12" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  variant?: "solid" | "outline" | "soft" | "subtle"
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  useTranslation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'subtle',
  size: 'md',
  useTranslation: true,
})

const { t } = useI18n()

// Map status to Nuxt UI Badge color
const statusColor = computed(() => {
  const statusValue = props.status.toLowerCase()

  switch (statusValue) {
    // Settlement Status - Success states
    case 'success':
    case 'yes':
    case 'completed':
      return 'success'

    // Settlement Status - Failed states
    case 'failed':
    case 'fail':
    case 'error':
      return 'error'

    // Settlement Status - Pending states
    case 'pending':
    case 'unpaid':
    case 'warning':
      return 'warning'

    // Active/Inactive states
    case 'active':
      return 'success'
    case 'inactive':
    case 'no':
      return 'neutral'

    // Other states
    case 'canceled':
    case 'cancelled':
    case 'expired':
      return 'neutral'
    case 'reversed':
      return 'warning'
    case 'processing':
    case 'in-progress':
      return 'info'
    default:
      return 'neutral'
  }
})

// Display text based on variant and translation preference
const displayText = computed(() => {
  const statusValue = props.status.toLowerCase()

  if (props.useTranslation) {
    // Use translation keys for settlement status
    switch (statusValue) {
      case 'pending':
        return t('status.pending')
      case 'processing':
        return t('status.processing')
      case 'completed':
        return t('status.completed')
      case 'failed':
        return t('status.failed')
      case 'success':
        return t('status.success')
      case 'error':
        return t('status.error')
      case 'active':
        return t('status.active')
      case 'inactive':
        return t('status.inactive')
      case 'yes':
        return t('status.yes')
      case 'no':
        return t('status.no')
      case 'canceled':
      case 'cancelled':
      case 'cancel':
        return t('status.cancel')
      case 'expire':
        return t('status.expire')
      case 'reversed':
        return t('status.reversed')
      default:
        return props.status
    }
  }
  return props.status
})
</script>
