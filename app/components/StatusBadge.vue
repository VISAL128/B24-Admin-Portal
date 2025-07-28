<template>
  <UBadge
    :label="displayText"
    :color="statusColor"
    :variant="variant"
    :size="props.size"
    :ui="{ base: rounded ? 'rounded-full' : 'rounded' }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  status: string
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  useTranslation?: boolean
  rounded?: boolean // New prop for rounded style
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'subtle',
  size: 'md',
  useTranslation: true,
  rounded: false, // Default to non-fully-rounded
})

const { t } = useI18n()

// Map status to Nuxt UI Badge color
const statusColor = computed(() => {
  const statusValue = props.status.toLowerCase()

  switch (statusValue) {
    // Settlement Status - Success states
    case 'success':
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

// Display text based on variant, translation preference, and capitalized
const displayText = computed(() => {
  const statusValue = props.status.toLowerCase()

  if (props.useTranslation) {
    // Use translation keys for settlement status
    switch (statusValue) {
      case 'pending':
        return t('status.pending')
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
      default:
        return props.status
    }
  }
  return props.status
})
</script>